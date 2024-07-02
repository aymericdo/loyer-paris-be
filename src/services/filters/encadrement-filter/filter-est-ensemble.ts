import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { EstEnsembleDistrictFilter } from '@services/filters/district-filter/district-filter-est-ensemble'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterEstEnsemble extends EncadrementFilterParent {
  DistrictFilter = EstEnsembleDistrictFilter
  mainCity: AvailableMainCities = 'estEnsemble'
  rangeRentsJsonPath = 'json-data/encadrements_est-ensemble_2024.json'
}
