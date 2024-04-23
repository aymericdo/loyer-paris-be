import { ParisDistrictItem } from '@interfaces/json-item-paris'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { ParisGeojson } from '@db/db'

export class ParisDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = ParisGeojson
  city: AvailableMainCities = 'paris'

  async getDistricts(): Promise<ParisDistrictItem[]> {
    return super.getDistricts() as Promise<ParisDistrictItem[]>
  }

  protected getDistrictsFromPostalCode(): ParisDistrictItem[] {
    if (this.postalCode) {
      // 75010 -> 10  75009 -> 9
      const code = this.postalCode.slice(-2)[0] === '0' ? this.postalCode.slice(-1) : this.postalCode.slice(-2)

      return (this.getDistrictsJson() as ParisDistrictItem[]).filter((district) => {
        return district.properties.c_ar === +code
      })
    } else {
      return []
    }
  }

  protected async getDistrictFromName(): Promise<ParisDistrictItem[]> {
    return (this.getDistrictsJson() as ParisDistrictItem[]).filter((district) => {
      return district.properties.l_qu === this.districtName
    })
  }
}
