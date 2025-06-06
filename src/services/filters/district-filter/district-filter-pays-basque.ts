import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { PaysBasqueGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'

export class DistrictFilterPaysBasque extends DistrictFilterParent {
  GeojsonCollection = PaysBasqueGeojson
  mainCity: AvailableMainCities = 'paysBasque'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }
}
