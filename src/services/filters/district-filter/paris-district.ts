import { ParisDistrictItem } from '@interfaces/json-item-paris'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { ParisGeojson } from '@db/db'

export class ParisDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = ParisGeojson
  mainCity: AvailableMainCities = 'paris'

  async getDistricts(): Promise<ParisDistrictItem[]> {
    return super.getDistricts() as Promise<ParisDistrictItem[]>
  }

  protected async getDistrictsFromPostalCode(): Promise<ParisDistrictItem[]> {
    if (!this.postalCode) return []

    // 75010 -> 10  75009 -> 9
    const code = this.postalCode.slice(-2)[0] === '0' ? this.postalCode.slice(-1) : this.postalCode.slice(-2)
    const districts = await this.GeojsonCollection.find(
      {
        'properties.c_ar': +code
      },
    ).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictFromName(): Promise<ParisDistrictItem[]> {
    const districts = await this.GeojsonCollection.find(
      {
        'properties.l_qu': this.districtName
      },
    ).lean()

    return districts?.length ? districts : []
  }
}
