import { AvailableCities, AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { PaysBasqueGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'
import { PaysBasqueDistrictItem } from '@interfaces/pays-basque'
import { zones } from '@services/filters/city-filter/zones'
import { postalCodes } from '@services/filters/city-filter/postal-codes'

export class DistrictFilterPaysBasque extends DistrictFilterParent {
  GeojsonCollection = PaysBasqueGeojson
  mainCity: AvailableMainCities = 'paysBasque'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromCity(): Promise<PaysBasqueDistrictItem[]> {
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
