import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { LyonGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'
import { LyonDistrictItem } from '@interfaces/lyon'

export class DistrictFilterLyon extends DistrictFilterParent {
  GeojsonCollection = LyonGeojson
  mainCity: AvailableMainCities = 'lyon'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromCity(): Promise<LyonDistrictItem[]> {
    if (!this.city) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.city': { $regex: this.city,  $options: 'i' }
      },
    ).lean()
    return districts?.length ? districts : []
  }
}
