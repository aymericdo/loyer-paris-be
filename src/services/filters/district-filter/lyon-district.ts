import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { LyonGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'
import { LyonDistrictItem } from '@interfaces/json-item-lyon'

export class LyonDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = LyonGeojson
  mainCity: AvailableMainCities = 'lyon'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromPostalCode(): Promise<LyonDistrictItem[]> {
    if (!this.postalCode || !this.city) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.city': new RegExp(`/^${this.city}$/`, 'i')
      },
    )
    return districts?.length ? districts : []
  }
}
