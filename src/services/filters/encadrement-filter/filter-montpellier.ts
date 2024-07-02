import { FilteredResult } from '@interfaces/ad'
import { AvailableMainCities } from '@services/address/city'
import { MontpellierDistrictFilter } from '@services/filters/district-filter/montpellier-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterMontpellier extends EncadrementFilterParent {
  city: AvailableMainCities = 'montpellier'
  DistrictFilter = MontpellierDistrictFilter
  // Extract possible range time from rangeRents (json-data/encadrements_montpellier.json)
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', '1991-2005', 'apres 2005']
  universalRangeTime: [number, number][] = [[null, 1946], [1946, 1970], [1971, 1990], [1991, 2005], [2005, null]]

  async filter(): Promise<FilteredResult[]> {
    const rentList = await this.filterRents()
    return await this.mappingResult(rentList)
  }
}
