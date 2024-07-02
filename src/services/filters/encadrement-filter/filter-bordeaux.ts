import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterBordeaux extends EncadrementFilterParent {
  mainCity: AvailableMainCities = 'bordeaux'
  rangeRentsJsonPath = 'json-data/encadrements_bordeaux_2024.json'
}
