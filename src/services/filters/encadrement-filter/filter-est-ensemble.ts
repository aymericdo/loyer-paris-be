import { FilteredResult } from '@interfaces/ad'
import { AvailableMainCities } from '@services/address/city'
import { EstEnsembleDistrictFilter } from '@services/filters/district-filter/est-ensemble-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterEstEnsemble extends EncadrementFilterParent {
  city: AvailableMainCities = 'estEnsemble'
  DistrictFilter = EstEnsembleDistrictFilter
  canHaveHouse = true

  async filter(): Promise<FilteredResult[]> {
    const rentList = await this.filterRents()
    return await this.mappingResult(rentList)
  }
}
