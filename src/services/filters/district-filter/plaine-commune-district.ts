import { DistrictFilterParent } from './district-filter-parent'
import { AvailableMainCities } from '@services/address/city'
import { DefaultDistrictItem } from '@interfaces/shared'

export class PlaineCommuneDistrictService extends DistrictFilterParent {
  city: AvailableMainCities = 'plaineCommune'

  getDistricts(): DefaultDistrictItem[] {
    return super.getDistricts()
  }
}
