import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { EstEnsembleGeojson } from '@db/db'

export class EstEnsembleDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = EstEnsembleGeojson
  mainCity: AvailableMainCities = 'estEnsemble'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }
}
