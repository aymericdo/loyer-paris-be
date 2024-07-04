import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterEstEnsemble } from '@services/filters/district-filter/district-filter-est-ensemble'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterEstEnsemble extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterEstEnsemble
  mainCity: AvailableMainCities = 'estEnsemble'
  rangeRentsJsonPath = 'json-data/encadrements_est-ensemble_2024.json'
}
