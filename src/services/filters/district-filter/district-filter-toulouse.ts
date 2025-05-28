import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { ToulouseGeojson } from '@db/db'
import { zones } from '@services/filters/city-filter/zones'
import { DefaultDistrictItem } from '@interfaces/shared'

export class DistrictFilterToulouse extends DistrictFilterParent {
  GeojsonCollection = ToulouseGeojson
  mainCity: AvailableMainCities = 'toulouse'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictFromName(): Promise<DefaultDistrictItem[]> {
    const zone: string = this.districtName.match(/(?<=Zone ).*/g)[0]
    const districts = await this.GeojsonCollection.find({
      'properties.zone': { $in: [zone] }
    }).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<DefaultDistrictItem[]> {
    if (!this.city) return []

    const currentZones: string[] = (zones(this.city) as string[]).map((zone: string) => zone.match(/(?<=Zone ).*/g)[0])

    const districts = await this.GeojsonCollection.find({
      'properties.zone': { $in: currentZones }
    }).lean()
    return districts?.length ? districts : []
  }
}
