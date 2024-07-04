import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterMontpellier } from '@services/filters/district-filter/district-filter-montpellier'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterMontpellier extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterMontpellier
  mainCity: AvailableMainCities = 'montpellier'
  rangeRentsJsonPath = 'json-data/encadrements_montpellier_2024.json'
  // Extract possible range time from rangeRents (json-data/encadrements_montpellier.json)
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', '1991-2005', 'apres 2005']
  universalRangeTime: [number, number][] = [[null, 1946], [1946, 1970], [1971, 1990], [1991, 2005], [2005, null]]
}
