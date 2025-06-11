import { DefaultDistrictItem, DistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { MontpellierGeojson } from '@db/db'

export class DistrictFilterMontpellier extends DistrictFilterParent {
  GeojsonCollection = MontpellierGeojson
  mainCity: AvailableMainCities = 'montpellier'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromCity(): Promise<DistrictItem[]> {
    // There is not other city in the Montpellier Agglomeration
    return await this.GeojsonCollection.find({}).lean() as DistrictItem[]
  }
}
