import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { LyonGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'

export class DistrictFilterLyon extends DistrictFilterParent {
  GeojsonCollection = LyonGeojson
  mainCity: AvailableMainCities = 'lyon'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }
}
