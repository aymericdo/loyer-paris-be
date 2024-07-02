import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLille extends EncadrementFilterParent {
  mainCity: AvailableMainCities = 'lille'
  rangeRentsJsonPath = 'json-data/encadrements_lille_2024.json'
}
