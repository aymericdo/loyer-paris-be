import { LilleDistrictItem } from '@interfaces/json-item-lille'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'

export class LilleDistrictFilter extends DistrictFilterParent {
  city: AvailableMainCities = 'lille'

  getDistricts(): LilleDistrictItem[] {
    return super.getDistricts() as LilleDistrictItem[]
  }

  protected getDistrictFromName(): LilleDistrictItem[] {
    return (this.getDistrictsJson() as LilleDistrictItem[]).filter((district) => {
      return +district.properties.zonage === +this.districtName.match(/\d+/)[0]
    })
  }
}

