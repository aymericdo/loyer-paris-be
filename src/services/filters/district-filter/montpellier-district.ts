import { DistrictFilterParent } from './district-filter-parent'
import { AvailableMainCities } from '@services/address/city'
import { DefaultDistrictItem } from '@interfaces/shared'

export class MontpellierDistrictService extends DistrictFilterParent {
  city: AvailableMainCities = 'montpellier'

  getDistricts(): DefaultDistrictItem[] {
    return super.getDistricts() as DefaultDistrictItem[]
  }
}
