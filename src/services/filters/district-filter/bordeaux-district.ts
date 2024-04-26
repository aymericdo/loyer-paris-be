import { BordeauxDistrictItem } from '@interfaces/json-item-bordeaux'
import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { BordeauxGeojson } from '@db/db'

export class BordeauxDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = BordeauxGeojson
  mainCity: AvailableMainCities = 'bordeaux'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromPostalCode(): Promise<BordeauxDistrictItem[]> {
    if (!this.postalCode) { return [] }

    const districts = await this.GeojsonCollection.find(
      {
        'properties.com_code': +this.postalCode
      },
    ).lean()
    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<BordeauxDistrictItem[]> {
    // There is not other city in the Bordeaux Agglomeration
    return await this.GeojsonCollection.find({}).lean()
  }
}
