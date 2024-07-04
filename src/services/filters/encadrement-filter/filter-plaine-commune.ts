import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterPlaineCommune } from '@services/filters/district-filter/district-filter-plaine-commune'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterPlaineCommune extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterPlaineCommune
  mainCity: AvailableMainCities = 'plaineCommune'
  rangeRentsJsonPath = 'json-data/encadrements_plaine-commune_2024.json'
}
