import { FilteredResult } from '@interfaces/ad'
import { AvailableMainCities } from '@services/address/city'
import { LyonDistrictFilter } from '@services/filters/district-filter/lyon-district'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLyon extends EncadrementFilterParent {
  city: AvailableMainCities = 'lyon'
  DistrictFilter = LyonDistrictFilter
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', '1991-2005', 'apres 2005']
  universalRangeTime: [number, number][] = [[null, 1946], [1946, 1970], [1971, 1990], [1991, 2005], [2005, null]]

  async filter(): Promise<FilteredResult[]> {
    const rentList = await this.filterRents()
    return await this.mappingResult(rentList)
  }
}
