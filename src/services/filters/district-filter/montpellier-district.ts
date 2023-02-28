import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'

export class MontpellierDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'montpellier'

  getDistricts(): DefaultDistrictItem[] {
    return super.getDistricts() as DefaultDistrictItem[]
  }
}
