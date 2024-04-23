import { DefaultDistrictItem, DistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { MontpellierGeojson } from '@db/db'

export class MontpellierDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = MontpellierGeojson
  mainCity: AvailableMainCities = 'montpellier'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromPostalCode(): Promise<DistrictItem[]> {
    // There is not other city in the Montpellier Agglomeration
    return await this.GeojsonCollection.find({})
  }
}
