import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterLille } from '@services/filters/district-filter/district-filter-lille'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLille extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterLille
  mainCity: AvailableMainCities = 'lille'
  rangeRentsJsonPath = 'json-data/encadrements_lille_2024.json'
}
