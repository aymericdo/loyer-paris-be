import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterBordeaux } from '@services/filters/district-filter/district-filter-bordeaux'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterBordeaux extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterBordeaux
  mainCity: AvailableMainCities = 'bordeaux'
  rangeRentsJsonPath = 'json-data/encadrements_bordeaux_2024.json'
}
