import { Coordinate, DistrictItem } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities } from '@services/address/city'

export class DistrictFilterParent {
  GeojsonCollection = null
  mainCity: AvailableMainCities = null
  city: AvailableCities = null

  coordinates: Coordinate = null
  postalCode: string = null
  districtName: string = null

  constructor(coordinates: Coordinate, options?: { city?: AvailableCities, postalCode?: string, districtName?: string }) {
    this.coordinates = coordinates
    this.city = options?.city
    this.postalCode = options?.postalCode
    this.districtName = options?.districtName
  }

  async getFirstDistrict(): Promise<DistrictItem> {
    return (await this.getDistricts())[0] as DistrictItem
  }

  async getDistricts(): Promise<DistrictItem[]> {
    if (this.districtName) {
      return this.getDistrictFromName()
    }

    const districtFromCoordinate =
      await this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

    if (districtFromCoordinate.length) {
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
    if (!this.coordinates?.lat || !this.coordinates?.lng) return []

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
