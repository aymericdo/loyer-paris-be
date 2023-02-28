import { BordeauxDistrictItem } from '@interfaces/json-item-lyon'
import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'

export class BordeauxDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'bordeaux'

  getDistricts(): DefaultDistrictItem[] {
    return super.getDistricts() as DefaultDistrictItem[]
  }

  protected getDistrictFromPostalCode(): BordeauxDistrictItem[] {
    if (this.postalCode) {
      return (this.getDistrictsJson() as BordeauxDistrictItem[]).filter((district) => {
        return district.properties.com_code === +this.postalCode
      })
    } else {
      return []
    }
  }
}
