import { ParisDistrictItem, ParisEncadrementItem } from '@interfaces/paris'
import { FilterParis } from '@services/filters/encadrement-filter/filter-paris'

// FilterFakes is build to simulate what could happen for cities that are not applies Encadrement yet
// We are using Paris data, but with the cheaper district (because we consider the cheaper in Paris shouldn't be more expensive than others cities)
export class FilterFakes extends FilterParis {
  protected async isDistrictMatch(_districtsMatched: ParisDistrictItem[], rangeRent: ParisEncadrementItem): Promise<boolean> {
    // from json-data/encadrements_paris_quartiers.json
    // Saint-Fargeau is the cheapest district of paris, the corresponding id zone is 13
    return rangeRent.id_zone === 13
  }
}
