import { ZoneDocument } from '@db/zone.model'
import {
  Coordinate,
  DefaultDistrictItemProperties,
  DistrictItemProperties,
} from '@interfaces/shared'
import { AvailableCities } from '@services/city-config/classic-cities'
import { isOnlyOneCity } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'

export class DistrictFilterParent {
  mainCity: AvailableMainCities = null
  GeojsonCollection = null
  city: AvailableCities = null
  coordinates: Coordinate = null
  postalCode: string = null
  districtName: string = null

  constructor({
    coordinates,
    city,
    postalCode,
    districtName,
  }: {
    coordinates?: Coordinate
    city?: AvailableCities
    postalCode?: string
    districtName?: string
  }) {
    this.coordinates = coordinates
    this.city = city
    this.postalCode = postalCode
    this.districtName = districtName
  }

  digZoneInProperties(data: DistrictItemProperties): string {
    return `Zone ${
      /^\d+$/.test((data as DefaultDistrictItemProperties).zone)
        ? +(data as DefaultDistrictItemProperties).zone
        : (data as DefaultDistrictItemProperties).zone
    }`
  }

  digCityInProperties(data: DistrictItemProperties): string {
    return (data as DefaultDistrictItemProperties).city
  }

  buildGroupBy(_elem: string): string {
    return null
  }

  async getFirstDistrict(): Promise<ZoneDocument> {
    return (await this.getDistricts())[0] as ZoneDocument
  }

  async getDistricts(): Promise<ZoneDocument[]> {
    if (this.districtName) {
      return this.getDistrictFromName()
    }

    const strategies = [
      () =>
        this.getDistrictFromCoordinate(
          this.coordinates?.lat,
          this.coordinates?.lng,
        ),
      () => this.getDistrictsFromPostalCode(),
      () => this.getDistrictsFromCity(),
      () => this.getDistrictsFromMainCity(),
    ]

    for (const strategy of strategies) {
      const result = await strategy()

      // Cas particulier pour getDistrictFromCoordinate qui peut retourner null
      if (Array.isArray(result) && result.length > 0) {
        return result
      }

      if (!Array.isArray(result) && result !== null) {
        return result
      }
    }

    // Par sécurité, fallback si toutes les stratégies échouent
    return []
  }

  protected async getDistrictFromName(): Promise<ZoneDocument[]> {
    const zone: number = +this.districtName.match(/\d+/)[0]

    const filter = {
      'properties.zone': zone.toString(),
    }

    if (this.city) {
      filter['properties.city'] = { $regex: this.city, $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromPostalCode(): Promise<ZoneDocument[]> {
    if (!this.postalCode) return []

    const districts = await this.GeojsonCollection.find({
      'properties.postalCode': this.postalCode.toString(),
    }).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<ZoneDocument[]> {
    if (!this.city) return []

    if (isOnlyOneCity(this.mainCity)) {
      return (await this.GeojsonCollection.find({}).lean()) as ZoneDocument[]
    } else {
      const districts = await this.GeojsonCollection.find({
        'properties.city': { $regex: this.city, $options: 'i' },
      }).lean()

      return districts?.length ? districts : []
    }
  }

  protected async getDistrictsFromMainCity(): Promise<ZoneDocument[]> {
    return await this.GeojsonCollection.find({}).lean()
  }

  private async getDistrictFromCoordinate(
    lat: number,
    lng: number,
  ): Promise<ZoneDocument[]> {
    if (!lat || !lng) return null

    const district = await this.GeojsonCollection.findOne({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        },
      },
    }).lean()

    return district ? [district] : []
  }
}
