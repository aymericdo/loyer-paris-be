import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { LilleDistrictFilter } from '@services/filters/district-filter/district-filter-lille'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterLille extends EncadrementFilterParent {
  DistrictFilter = LilleDistrictFilter
  mainCity: AvailableMainCities = 'lille'
  rangeRentsJsonPath = 'json-data/encadrements_lille_2024.json'
}
