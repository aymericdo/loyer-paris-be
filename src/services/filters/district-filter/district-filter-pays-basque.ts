import { AvailableMainCities } from '@services/filters/city-filter/city-list'
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
