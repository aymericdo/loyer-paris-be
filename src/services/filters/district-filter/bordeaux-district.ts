import { BordeauxDistrictItem } from '@interfaces/json-item-bordeaux'
import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'

export class BordeauxDistrictFilter extends DistrictFilterParent {
  mainCity: AvailableMainCities = 'bordeaux'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromPostalCode(): Promise<BordeauxDistrictItem[]> {
    if (this.postalCode) {
      const districts = await this.GeojsonCollection.find(
        {
          'properties.com_code': +this.postalCode
        },
      )
      return districts?.length ? districts : []
    } else {
      // There is not other city in the Bordeaux Agglomeration
      return await this.GeojsonCollection.find({})
    }
  }
}
