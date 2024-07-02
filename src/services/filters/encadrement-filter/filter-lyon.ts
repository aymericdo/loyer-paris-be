import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLyon extends EncadrementFilterParent {
  mainCity: AvailableMainCities = 'lyon'
  rangeRentsJsonPath = 'json-data/encadrements_lyon_2024.json'
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', '1991-2005', 'apres 2005']
  universalRangeTime: [number, number][] = [[null, 1946], [1946, 1970], [1971, 1990], [1991, 2005], [2005, null]]
}
