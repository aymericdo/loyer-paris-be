import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { ToulouseGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'

export class DistrictFilterToulouse extends DistrictFilterParent {
  GeojsonCollection = ToulouseGeojson
  mainCity: AvailableMainCities = 'toulouse'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }
}
