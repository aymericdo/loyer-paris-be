import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './district-filter-parent'
import { Coordinate } from '@interfaces/shared'
import { AvailableCities } from '@services/city-config/classic-cities'
import { ZoneDocument } from '@db/zone.model'
import { Model } from 'mongoose'

export class GenericDistrictFilter extends DistrictFilterParent {
  constructor(
    mainCity: AvailableMainCities,
    geojson: Model<ZoneDocument>,
    {
      coordinates,
      city,
      postalCode,
      districtName,
    }: {
      coordinates?: Coordinate
      city?: AvailableCities
      postalCode?: string
      districtName?: string
    } = {},
  ) {
    super({ coordinates, city, postalCode, districtName })
    this.mainCity = mainCity
    this.GeojsonCollection = geojson
  }

  async getDistricts(): Promise<ZoneDocument[]> {
    return super.getDistricts() as Promise<ZoneDocument[]>
  }
}
