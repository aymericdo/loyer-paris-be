import { Coordinate, DistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictsList } from '@services/districts/districts-list'

export class DistrictFilterParent {
  GeojsonCollection = null
  city: AvailableMainCities = null

  coordinates: Coordinate = null
  postalCode: string = null
  districtName: string = null

  constructor(postalCode: string, coordinates?: Coordinate, districtName?: string) {
    this.coordinates = coordinates
    this.postalCode = postalCode
    this.districtName = districtName
  }

  getFirstDistrict(): DistrictItem {
    return this.getDistricts()[0] as DistrictItem
  }

  async getDistricts(): Promise<DistrictItem[]> {
    if (this.districtName) {
      return this.getDistrictFromName()
    }

    const districtFromCoordinate =
      this.coordinates?.lat &&
      this.coordinates?.lng &&
      await this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

    return districtFromCoordinate?.length ? districtFromCoordinate : this.getDistrictsFromPostalCode()
  }

  protected getDistrictsJson(): DistrictItem[] {
    return new DistrictsList(this.city as AvailableMainCities).currentGeodata().features
  }

  protected async getDistrictFromName(): Promise<DistrictItem[]> {
    const zone: number = +this.districtName.match(/\d+/)[0]
    const districts = await this.GeojsonCollection.find(
      {
        'properties.Zone': { $in: [zone, zone.toString()] }
      },
    )

    return districts?.length ? districts : []
  }

  protected getDistrictsFromPostalCode(): DistrictItem[] {
    return []
  }

  private async getDistrictFromCoordinate(lat: number, lng: number): Promise<DistrictItem[]> {
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
    )

    return district ? [district] : []
  }
}
