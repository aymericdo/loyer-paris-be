import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterLyon } from '@services/filters/district-filter/district-filter-lyon'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLyon extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterLyon
  mainCity: AvailableMainCities = 'lyon'
  rangeRentsJsonPath = 'json-data/encadrements_lyon_2024.json'
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', '1991-2005', 'apres 2005']
}
