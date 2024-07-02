import {
  BordeauxAddress,
  EstEnsembleAddress,
  LilleAddress,
  LyonAddress,
  MontpellierAddress,
  ParisAddress,
  PlaineCommuneAddress,
} from '@db/db'
import { Ad } from '@interfaces/ad'
import { Coordinate, AddressItem, DefaultAddressItemDB, AddressItemDB } from '@interfaces/shared'
import { AvailableCities, cityList } from '@services/filters/city-filter/valid-cities-list'
import { regexString } from '@services/helpers/regex'
import * as cleanup from '@services/helpers/cleanup'

export const dbMapping = {
  paris: ParisAddress,
  lyon: LyonAddress,
  lille: LilleAddress,
  plaineCommune: PlaineCommuneAddress,
  estEnsemble: EstEnsembleAddress,
  montpellier: MontpellierAddress,
  bordeaux: BordeauxAddress,
}

export abstract class AddressService {
  abstract getAddress(): Promise<[string, Coordinate, Coordinate]>

  static async getAddresses(city: AvailableCities, query: string): Promise<AddressItemDB[]> {
    const addressDb = dbMapping[cityList[city].mainCity]
    return (await addressDb
      .find(
        {
          $text: { $search: query },
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .lean()) as DefaultAddressItemDB[]
  }
}

export class DefaultAddressService implements AddressService {
  private city: AvailableCities
  private postalCode: string
  private ad: Ad
  coordinates: Coordinate
  blurryCoordinates: Coordinate

  constructor(city: AvailableCities, postalCode: string, ad: Ad) {
    this.city = city
    this.postalCode = postalCode
    this.ad = ad
  }

  async getAddress(): Promise<[string, Coordinate, Coordinate]> {
    const tab = [this.ad.address, this.ad.title, this.ad.description].filter(Boolean)

    for (const text of tab) {
      const result = await this.digForAddressInText(this.city, this.postalCode, text)
      if (result) {
        const coord = this.getCoordinate()
        const blurryCoord = this.getCoordinate(true)
        return [result, coord, blurryCoord]
      }
    }
    return [null, null, null]
  }

  private async digForAddressInText(city: AvailableCities, postalCode: string, text: string): Promise<string> {
    const addressRe = new RegExp(regexString('address'))
    const addressesFromRegex = text.match(addressRe) as string[]
    if (addressesFromRegex?.length) {
      const addressesQueries = this.querifyAddresses(city, addressesFromRegex)

      const result: {
        item: AddressItem
        score: number
        streetNumber: string
      }[] = (
        await Promise.all(
          addressesQueries.map(async (query) => {
            return await this.getAddressCompleted(city, query)
          })
        )
      )
        .flat()
        .filter((r) => (postalCode ? r.item.postalCode === postalCode : true))
        .sort((a, b) => b.score - a.score)

      if (result?.length) {
        this.setCoordinates(result[0].item.coordinate, result[0].streetNumber)
        return result[0].streetNumber
          ? cleanup.string(result[0].item.address).replace(/^\d+(b|t)?/g, result[0].streetNumber.toString())
          : cleanup
            .string(result[0].item.address)
            .replace(/^\d+(b|t)?/g, '')
            .trim()
      } else {
        return null
      }
    } else {
      return null
    }
  }

  private querifyAddresses(city: AvailableCities, addressesFromRegex: string[]): string[] {
    return addressesFromRegex
      .map((a) => (cleanup.address(a, city) ?? null))
      .filter(Boolean)
  }

  protected async getAddressCompleted(
    city: AvailableCities,
    query: string
  ): Promise<
    {
      item: AddressItem
      score: number
      streetNumber: string
    }[]
  > {
    if (!query) {
      return null
    }

    const result: DefaultAddressItemDB[] = await AddressService.getAddresses(city, query) as DefaultAddressItemDB[]

    return result
      ? result.map((r: DefaultAddressItemDB) => ({
        item: {
          address: `${r.numero} ${r.nom_voie}`,
          postalCode: r.code_postal.toString(),
          coordinate: {
            lng: +r.geometry?.coordinates[0],
            lat: +r.geometry?.coordinates[1],
          },
        },
        score: r.score,
        streetNumber: cleanup.streetNumber(query)?.toString(),
      }))
      : []
  }

  private setCoordinates(coord: Coordinate, streetNumber: string): void {
    if (streetNumber) {
      this.coordinates = { ...coord }
    } else {
      this.blurryCoordinates = { ...coord }
    }
  }

  private getCoordinate(blurry = false): Coordinate {
    const coordinatesFromAd =
      this.ad.coord?.lng && this.ad.coord?.lat
        ? {
          lng: this.ad.coord.lng,
          lat: this.ad.coord.lat,
        }
        : null

    if (coordinatesFromAd?.lng.toString().length > 9 && coordinatesFromAd?.lat.toString().length > 9) {
      return coordinatesFromAd
    } else {
      if (blurry) {
        return this.blurryCoordinates || coordinatesFromAd
      } else {
        return this.coordinates || coordinatesFromAd
      }
    }
  }
}