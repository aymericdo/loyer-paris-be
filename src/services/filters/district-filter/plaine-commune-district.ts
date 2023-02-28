import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'

export class PlaineCommuneDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'plaineCommune'

  getDistricts(): DefaultDistrictItem[] {
    return super.getDistricts() as DefaultDistrictItem[]
  }
}
