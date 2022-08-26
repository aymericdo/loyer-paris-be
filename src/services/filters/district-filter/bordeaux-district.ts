import { DistrictFilterParent } from './district-filter-parent'
import { AvailableMainCities } from '@services/address/city'
import { DefaultDistrictItem } from '@interfaces/shared'

export class BordeauxDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'bordeaux'

  getDistricts(): DefaultDistrictItem[] {
    return super.getDistricts() as DefaultDistrictItem[]
  }
}
