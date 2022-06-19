import { DistrictFilterParent } from './district-filter-parent'
import { AvailableMainCities } from '@services/address/city'
import { ParisDistrictItem } from '@interfaces/json-item-paris'

export class ParisDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'paris'

  getDistricts(): ParisDistrictItem[] {
    return super.getDistricts() as ParisDistrictItem[]
  }

  protected getDistrictFromPostalCode(): ParisDistrictItem[] {
    if (this.postalCode) {
      // 75010 -> 10  75009 -> 9
      const code =
        this.postalCode.slice(-2)[0] === '0'
          ? this.postalCode.slice(-1)
          : this.postalCode.slice(-2)

      return (this.getDistrictsJson() as ParisDistrictItem[]).filter((district) => {
        return district.properties.c_ar === +code
      })
    } else {
      return []
    }
  }

  protected getDistrictFromName(): ParisDistrictItem[] {
    return (this.getDistrictsJson() as ParisDistrictItem[]).filter((district) => {
      return district.properties.l_qu === this.districtName
    })
  }
}
