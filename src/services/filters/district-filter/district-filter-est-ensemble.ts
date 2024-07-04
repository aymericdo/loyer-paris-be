import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { EstEnsembleGeojson } from '@db/db'

export class DistrictFilterEstEnsemble extends DistrictFilterParent {
  GeojsonCollection = EstEnsembleGeojson
  mainCity: AvailableMainCities = 'estEnsemble'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }
}
