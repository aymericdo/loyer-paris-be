import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { BordeauxGeojson } from '@db/db'

export class DistrictFilterBordeaux extends DistrictFilterParent {
  GeojsonCollection = BordeauxGeojson
  mainCity: AvailableMainCities = 'bordeaux'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromCity(): Promise<DefaultDistrictItem[]> {
    // There is not other city in the Bordeaux Agglomeration
    return await this.GeojsonCollection.find({}).lean()
  }
}
