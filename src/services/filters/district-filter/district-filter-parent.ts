import { AddressItemDB, Coordinate, DefaultAddressItemDB, DistrictItem } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities } from '@services/address/city'

export class DistrictFilterParent {
  GeojsonCollection = null
  mainCity: AvailableMainCities = null
  city: AvailableCities = null
  coordinates: Coordinate = null
  blurryCoordinates: Coordinate = null
  postalCode: string = null
  districtName: string = null

  constructor(
    { coordinates, blurryCoordinates, city, postalCode, districtName }:
    { coordinates?: Coordinate, blurryCoordinates?: Coordinate, city?: AvailableCities, postalCode?: string, districtName?: string }) {
    this.coordinates = coordinates
    this.blurryCoordinates = blurryCoordinates
    this.city = city
    this.postalCode = postalCode
    this.districtName = districtName
  }

  digZoneInProperties(data: unknown): string {
    return `Zone ${data['Zone']}`
  }

  buildItem(district: DistrictItem, elem: AddressItemDB): DefaultAddressItemDB {
    return {
      ...elem,
      districtName: district ? this.digZoneInProperties(district['properties']) : null,
      fields: {
        l_adr: `${(elem as DefaultAddressItemDB).numero}${(elem as DefaultAddressItemDB).rep || ''} `+
          `${(elem as DefaultAddressItemDB).nom_voie} (${(elem as DefaultAddressItemDB).code_postal})`,
      },
    } as DefaultAddressItemDB
  }

  buildGroupBy(_elem: string): string {
    return null
  }

  async getFirstDistrict(): Promise<DistrictItem> {
    return (await this.getDistricts())[0] as DistrictItem
  }

  async getDistricts(): Promise<DistrictItem[]> {
    if (this.districtName) {
      return this.getDistrictFromName()
    }

    const districtFromCoordinate =
      await this.getDistrictFromCoordinate(this.coordinates?.lat, this.coordinates?.lng)

    if (districtFromCoordinate.length) {
      return districtFromCoordinate
    }

    const districtFromBlurryCoordinate =
      await this.getDistrictFromCoordinate(this.blurryCoordinates?.lat, this.blurryCoordinates?.lng)

    if (districtFromBlurryCoordinate.length) {
      return districtFromBlurryCoordinate
    }

    const districtFromPostalCode =
      await this.getDistrictsFromPostalCode()

    if (districtFromPostalCode.length) {
      return districtFromPostalCode
    }

    const districtFromSpecificCity =
      await this.getDistrictsFromCity()

    if (districtFromSpecificCity.length) {
      return districtFromSpecificCity
    }

    return await this.getDistrictsFromMainCity()
  }

  protected async getDistrictFromName(): Promise<DistrictItem[]> {
    const zone: number = +this.districtName.match(/\d+/)[0]
    const districts = await this.GeojsonCollection.find(
      {
        'properties.Zone': { $in: [zone, zone.toString()] }
      },
    ).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromPostalCode(): Promise<DistrictItem[]> {
    return []
  }

  protected async getDistrictsFromCity(): Promise<DistrictItem[]> {
    return []
  }

  protected async getDistrictsFromMainCity(): Promise<DistrictItem[]> {
    return await this.GeojsonCollection.find({}).lean()
  }

  private async getDistrictFromCoordinate(lat: number, lng: number): Promise<DistrictItem[]> {
    if (!lat || !lng) return []

    const district = await this.GeojsonCollection.findOne(
      {
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        }
      }
    ).lean()

    return district ? [district] : []
  }
}
