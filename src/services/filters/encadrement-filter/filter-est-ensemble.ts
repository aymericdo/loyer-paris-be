import { EstEnsembleDistrictItem } from '@interfaces/est-ensemble'
import { DistrictItem, EncadrementItem, DefaultEncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterEstEnsemble } from '@services/filters/district-filter/district-filter-est-ensemble'
import { EncadrementFilterParent } from '@services/filters/encadrement-filter/encadrement-filter-parent'

export class FilterEstEnsemble extends EncadrementFilterParent {
  DistrictFilter = DistrictFilterEstEnsemble
  mainCity: AvailableMainCities = 'estEnsemble'
  rangeRentsJsonPath = 'json-data/encadrements_est-ensemble_2024.json'

  protected async isDistrictMatch(districtsMatched: DistrictItem[], rangeRent: EncadrementItem): Promise<boolean> {
    return districtsMatched?.length
      ? districtsMatched.map((district: EstEnsembleDistrictItem) => +district.properties.Zone)
        .includes(+(rangeRent as DefaultEncadrementItem).zone)
      : false
  }
}
