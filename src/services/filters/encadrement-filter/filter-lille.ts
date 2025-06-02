import { AvailableMainCities } from '@services/city-config/list'
import { DistrictFilterLille } from '@services/filters/district-filter/district-filter-lille'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLille extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterLille
  mainCity: AvailableMainCities = 'lille'
  rangeRentsJsonPath = 'json-data/encadrements_lille_2024.json'
}
