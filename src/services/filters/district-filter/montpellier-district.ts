import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { MontpellierGeojson } from '@db/db'

export class MontpellierDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = MontpellierGeojson
  city: AvailableMainCities = 'montpellier'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }
}
