import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterPlaineCommune extends EncadrementFilterParent {
  mainCity: AvailableMainCities = 'plaineCommune'
  rangeRentsJsonPath = 'json-data/encadrements_plaine-commune_2024.json'
}
