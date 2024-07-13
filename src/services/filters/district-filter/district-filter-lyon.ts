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

  digCityInProperties(data: unknown): string {
    return data['city']
  }

  protected async getDistrictFromName(): Promise<LyonDistrictItem[]> {
    const zone: number = +this.districtName.match(/\d+/)[0]

    const filter = {
      'properties.Zone': { $in: [zone, zone.toString()] }
    }

    if (this.city) {
      filter['properties.city'] = { $regex: this.city,  $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts : []
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
