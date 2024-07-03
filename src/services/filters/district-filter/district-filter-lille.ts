import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { LilleGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'

export class LilleDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = LilleGeojson
  mainCity: AvailableMainCities = 'lille'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromCity(): Promise<DefaultDistrictItem[]> {
    // There is not other city in the Lille Agglomeration
    return await this.GeojsonCollection.find({}).lean()
  }
}
