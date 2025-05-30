import { DataGouvAddressItem, FinalDataGouvAddressItem } from '@interfaces/address'
import { Coordinate, DistrictItem, Properties } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities } from '@services/filters/city-filter/city-list'

export class DistrictFilterParent {
  GeojsonCollection = null
  mainCity: AvailableMainCities = null
  city: AvailableCities = null
  coordinates: Coordinate = null
  postalCode: string = null
  districtName: string = null

  constructor(
    { coordinates, city, postalCode, districtName }:
    { coordinates?: Coordinate, city?: AvailableCities, postalCode?: string, districtName?: string }) {
    this.coordinates = coordinates
    this.city = city
    this.postalCode = postalCode
    this.districtName = districtName
  }

  digZoneInProperties(data: Properties): string {
    return `Zone ${data.zone ? /^\d+$/.test(data.zone) ? +data.zone : data.zone : data.Zone}`
  }

  digCityInProperties(data: Properties): string {
    return data.city
  }

  buildItem(district: DistrictItem, elem: DataGouvAddressItem): FinalDataGouvAddressItem {
    return {
      ...elem,
      districtName: district ? this.digZoneInProperties(district['properties'] as Properties) : null,
    } as FinalDataGouvAddressItem
  }

  buildGroupBy(_elem: string): string {
    return null
  }

  async getFirstDistrict(): Promise<DistrictItem> {
    return (await this.getDistricts())[0] as DistrictItem
  }

  async getDistricts(): Promise<DistrictItem[]> {
    if (this.districtName) {
      return await this.getDistrictFromName()
    }

    const districtFromCoordinate =
      await this.getDistrictFromCoordinate(this.coordinates?.lat, this.coordinates?.lng)

    if (districtFromCoordinate !== null) {
      return districtFromCoordinate
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
    if (!lat || !lng) return null

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
