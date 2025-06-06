import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterPaysBasque } from '@services/filters/district-filter/district-filter-pays-basque'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterPaysBasque extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterPaysBasque
  mainCity: AvailableMainCities = 'paysBasque'
  rangeRentsJsonPath = 'json-data/encadrements_pays-basque_2024.json'
}
