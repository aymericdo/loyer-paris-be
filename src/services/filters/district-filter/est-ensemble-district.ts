import { DistrictFilterParent } from './district-filter-parent'
import { AvailableMainCities } from '@services/address/city'
import { DefaultDistrictItem } from '@interfaces/shared'

export class EstEnsembleDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'estEnsemble'

  getDistricts(): DefaultDistrictItem[] {
    return super.getDistricts() as DefaultDistrictItem[]
  }
}
