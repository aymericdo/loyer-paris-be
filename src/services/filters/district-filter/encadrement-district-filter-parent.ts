import { DataGouvAddressItem, FinalDataGouvAddressItem } from '@interfaces/address'
import { Coordinate, DistrictItem, DefaultDistrictItemProperties, DistrictItemProperties } from '@interfaces/shared'
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

  digZoneInProperties(data: DistrictItemProperties): string {
    return `Zone ${/^\d+$/.test((data as DefaultDistrictItemProperties).zone) ?
      +(data as DefaultDistrictItemProperties).zone :
      (data as DefaultDistrictItemProperties).zone}`
  }

  digCityInProperties(data: DistrictItemProperties): string {
    return (data as DefaultDistrictItemProperties).city
  }

  buildItem(district: DistrictItem, elem: DataGouvAddressItem): FinalDataGouvAddressItem {
    return {
      ...elem,
      districtName: district ? this.digZoneInProperties(district['properties']) : null,
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

    const filter = {
      'properties.zone': { $in: [zone, zone.toString()] }
    }

    if (this.city) {
      filter['properties.city'] = { $regex: this.city, $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromPostalCode(): Promise<DistrictItem[]> {
    if (!this.postalCode) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.postalCode': this.postalCode.toString(),
      },
    ).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<DistrictItem[]> {
    if (!this.city) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.city': { $regex: this.city, $options: 'i' }
      },
    ).lean()

    return districts?.length ? districts : []
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
