import { ZoneDocument } from '@db/zone.model'
import { InfoToFilter } from '@interfaces/ad'
import { EstEnsembleDistrictItemProperties } from '@interfaces/est-ensemble'
import { EncadrementItem, DefaultEncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FilterParent } from '@services/filters/encadrement-filter/filter-parent'

export class EstEnsembleFilter extends FilterParent {
  mainCity: AvailableMainCities = 'estEnsemble'
  criteriaJsonPath = 'json-data/encadrements_est-ensemble_2025.json'

  constructor(
    infoToFilter: InfoToFilter,
    rentalStartDate?: Date,
    criteriaJsonPath?: string,
  ) {
    super(infoToFilter, rentalStartDate)
    if (criteriaJsonPath) {
      this.criteriaJsonPath = criteriaJsonPath
    }
  }

  protected async isDistrictMatch(
    districtsMatched: ZoneDocument[],
    rangeRent: EncadrementItem,
  ): Promise<boolean> {
    return districtsMatched?.length
      ? districtsMatched
          .map(
            (district) =>
              +(district.properties as EstEnsembleDistrictItemProperties).Zone,
          )
          .includes(+(rangeRent as DefaultEncadrementItem).zone)
      : false
  }
}
