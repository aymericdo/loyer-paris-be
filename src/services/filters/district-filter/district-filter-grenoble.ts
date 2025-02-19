import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { GrenobleGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'
import { GrenobleDistrictItem } from '@interfaces/grenoble'
import { zones } from '@services/filters/city-filter/zones'

export class DistrictFilterGrenoble extends DistrictFilterParent {
  GeojsonCollection = GrenobleGeojson
  mainCity: AvailableMainCities = 'grenoble'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromCity(): Promise<GrenobleDistrictItem[]> {
    if (!this.city) return []

    const currentZones: number[] = (zones(this.city) as string[]).map((zone: string) => +zone.match(/\d+/)[0])

    const districts = await this.GeojsonCollection.find(
      {
        'properties.Zone': { $in: currentZones }
      },
    ).lean()
    return districts?.length ? districts : []
  }
}
