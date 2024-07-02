import { FilteredResult } from '@interfaces/ad'
import { AvailableMainCities } from '@services/address/city'
import { BordeauxDistrictFilter } from '@services/filters/district-filter/bordeaux-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterBordeaux extends EncadrementFilterParent {
  city: AvailableMainCities = 'bordeaux'
  DistrictFilter = BordeauxDistrictFilter
  canHaveHouse = true

  async filter(): Promise<FilteredResult[]> {
    const rentList = await this.filterRents()
    return await this.mappingResult(rentList)
  }
}
