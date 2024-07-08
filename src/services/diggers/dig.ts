import { Ad, CleanAd } from '@interfaces/ad'
import { Coordinate } from '@interfaces/shared'
import { AddressServiceFactory } from '@services/diggers/address/address-factory'
import { AvailableCities, getMainCity } from '@services/filters/city-filter/city-list'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { PrettyLog } from '@services/helpers/pretty-log'
import { regexString } from '@services/helpers/regex'
import { stringToNumber } from '@services/helpers/string-to-number'
import { YearBuiltService } from '@services/helpers/year-built'
import { PARTICULIER_WORD, DPE_LIST } from '@services/websites/website'
import { PostalCodeFactory } from '@services/diggers/postal-code/encadrement-postal-code-factory'
import { canHaveHouse } from '@services/filters/city-filter/can-have-house'
export class DigService {
  ad: Ad = null

  constructor(ad: Ad) {
    this.ad = ad
  }

  async digInAd(city: AvailableCities): Promise<CleanAd> {
    const [address, postalCode, stations, coordinates, blurryCoordinates] = await this.digForAddress(city)

    const roomCount = this.digForRoomCount()
    const hasFurniture = this.digForHasFurniture()
    const surface = this.digForSurface()
    const price = this.digForPrice()
    // Very edgy case : if 'paris', we have a YearBuilt fallback thanks to emprise batie data
    const yearBuilt = await this.digForYearBuilt(city === 'paris' ? coordinates : null)
    const renter = this.digForRenter()
    const charges = this.digForCharges()
    const hasCharges = this.digForHasCharges()
    const isHouse = canHaveHouse(getMainCity(city)) ? this.digForIsHouse() : null
    const dpe = this.digForDPE()

    return {
      id: this.ad.id,
      roomCount,
      hasFurniture,
      surface,
      price,
      address,
      postalCode,
      city,
      coordinates,
      blurryCoordinates,
      yearBuilt,
      renter,
      stations,
      charges,
      hasCharges,
      isHouse,
      dpe,
    }
  }

  private async digForAddress(city: AvailableCities): Promise<[string, string, string[], Coordinate, Coordinate]> {
    const mainCity = getMainCity(city)
    const CurrentPostalCodeService = new PostalCodeFactory(mainCity).currentPostalCodeService()

    // Order is important here
    const postalCode = new CurrentPostalCodeService(city).getPostalCode(this.ad)
    const CurrentAddressService = new AddressServiceFactory(city).currentAddressService()
    const [address, coordinates, blurryCoordinates] = await new CurrentAddressService(city, postalCode, this.ad).getAddress()

    const stations = this.ad.stations

    if (!address && !postalCode && !coordinates) {
      throw {
        error: ERROR_CODE.Address,
        msg: 'address not found',
        isIncompleteAd: true,
      }
    }

    return [address, postalCode, stations, coordinates, blurryCoordinates]
  }

  private digForRoomCount(): number {
    const roomsFromTitle =
      this.ad.title && this.ad.title.match(regexString('roomCount')) && this.ad.title.match(regexString('roomCount'))[0]
    const roomsFromDescription =
      this.ad.description &&
      this.ad.description.match(regexString('roomCount')) &&
      this.ad.description.match(regexString('roomCount'))[0]
    return (!!this.ad.rooms && this.ad.rooms) || stringToNumber(roomsFromTitle) || stringToNumber(roomsFromDescription)
  }

  private async digForYearBuilt(coordinates?: Coordinate): Promise<number[]> {
    if (this.ad.yearBuilt && this.ad.yearBuilt != null && !isNaN(this.ad.yearBuilt)) {
      return [+this.ad.yearBuilt]
    } else if (coordinates) {
      const building =
        coordinates &&
        coordinates.lat &&
        coordinates.lng &&
        (await YearBuiltService.getEmpriseBatieBuilding(coordinates.lat, coordinates.lng))
      const yearBuiltFromBuilding = building && YearBuiltService.getYearBuiltFromBuilding(building)

      return yearBuiltFromBuilding
    } else {
      return null
    }
  }

  private digForHasFurniture(): boolean {
    const furnitureFromTitle = this.ad.title && this.ad.title.match(regexString('furnished'))
    const nonFurnitureFromTitle = this.ad.title && this.ad.title.match(regexString('nonFurnished'))
    const furnitureFromDescription = this.ad.description && this.ad.description.match(regexString('furnished'))
    const nonFurnitureFromDescription = this.ad.description && this.ad.description.match(regexString('nonFurnished'))
    return this.ad.furnished != null
      ? !!this.ad.furnished
      : (furnitureFromDescription && furnitureFromDescription.length > 0) ||
        (furnitureFromTitle && furnitureFromTitle.length > 0)
        ? true
        : (nonFurnitureFromDescription && nonFurnitureFromDescription.length > 0) ||
        (nonFurnitureFromTitle && nonFurnitureFromTitle.length > 0)
          ? false
          : null
  }

  private digForSurface(): number {
    const surface =
      this.ad.surface ||
      (this.ad.title &&
        this.ad.title.match(regexString('surface')) &&
        cleanup.number(this.ad.title.match(regexString('surface'))[0])) ||
      (this.ad.description &&
        this.ad.description.match(regexString('surface')) &&
        cleanup.number(this.ad.description.match(regexString('surface'))[0]))

    if (!surface) {
      throw {
        error: ERROR_CODE.Surface,
        msg: 'surface not found',
        isIncompleteAd: true,
      }
    }

    return surface
  }

  private digForPrice(): number {
    if (!this.ad.price) {
      throw {
        error: ERROR_CODE.Price,
        msg: 'price not found',
        isIncompleteAd: true,
      }
    } else if (this.ad.price > 30000) {
      PrettyLog.call(`price "${this.ad.price}" too expensive to be a rent`, 'yellow')
      throw {
        error: ERROR_CODE.Price,
        msg: 'price too expensive to be a rent',
      }
    } else if (this.ad.price < 100) {
      PrettyLog.call(`price "${this.ad.price}" too cheap to be a rent`, 'yellow')
      throw {
        error: ERROR_CODE.Price,
        msg: 'price too cheap to be a rent',
      }
    }

    return this.ad.price
  }

  private digForRenter(): string {
    const possibleBadRenter = ['seloger', 'leboncoin', 'lefigaro', 'pap', 'orpi', 'logicimmo']

    const renter = possibleBadRenter.includes(this.ad.renter) ? null : this.ad.renter

    return renter?.match(regexString('particulier'))?.length ? PARTICULIER_WORD : cleanup.string(renter)
  }

  private digForIsHouse(): boolean {
    const isHouseFromTitle =
      this.ad.title?.match(regexString('isHouse')) && this.ad.title?.match(regexString('isHouse'))[0]

    const isHouseFromDescription =
      this.ad.description?.match(regexString('isHouse')) && this.ad.description?.match(regexString('isHouse'))[0]

    return isHouseFromTitle?.length > 0 || isHouseFromDescription?.length > 0
  }

  private digForCharges(): number {
    const charges =
      this.ad.charges ||
      (this.ad.description?.match(regexString('charges')) &&
        cleanup.price(this.ad.description.match(regexString('charges'))[0]))
    return +charges < 300 ? charges : null // to be defensive
  }

  private digForHasCharges(): boolean {
    return (
      this.ad.hasCharges ||
      (this.ad.description?.match(regexString('hasCharges')) &&
        !!this.ad.description.match(regexString('hasCharges')).length)
    )
  }

  private digForDPE(): string | null {
    const DPE = this.ad.dpe?.toUpperCase()
    return DPE?.split(' ')?.find((word) => DPE_LIST.includes(word)) || null
  }
}
