import { LilleDistrictItem } from '@interfaces/json-item-lille'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'

export class LilleDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'lille'

  getDistricts(): LilleDistrictItem[] {
    return super.getDistricts() as LilleDistrictItem[]
  }
}
