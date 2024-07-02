import { FilteredResult } from '@interfaces/ad'
import { AvailableMainCities } from '@services/address/city'
import { LilleDistrictFilter } from '@services/filters/district-filter/lille-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLille extends EncadrementFilterParent {
  city: AvailableMainCities = 'lille'
  DistrictFilter = LilleDistrictFilter

  async filter(): Promise<FilteredResult[]> {
    const rentList = await this.filterRents()
    return await this.mappingResult(rentList)
  }
}
