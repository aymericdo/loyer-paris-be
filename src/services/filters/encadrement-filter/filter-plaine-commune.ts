import { FilteredResult } from '@interfaces/ad'
import { AvailableMainCities } from '@services/address/city'
import { PlaineCommuneDistrictFilter } from '@services/filters/district-filter/plaine-commune-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterPlaineCommune extends EncadrementFilterParent {
  city: AvailableMainCities = 'plaineCommune'
  DistrictFilter = PlaineCommuneDistrictFilter
  canHaveHouse = true

  async filter(): Promise<FilteredResult[]> {
    const rentList = await this.filterRents()
    return await this.mappingResult(rentList)
  }
}
