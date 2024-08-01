import { BordeauxEncadrementItem } from '@interfaces/bordeaux'
import { ParisDistrictItem } from '@interfaces/paris'
import { FilterBordeaux } from '@services/filters/encadrement-filter/filter-bordeaux'

// FilterFakes is build to simulate what could happen for cities that are not applies Encadrement yet
// We are using Bordeaux data, but with the cheaper zone (because we consider the cheaper in Bordeaux shouldn't be more expensive than news cities)
export class FilterFakes extends FilterBordeaux {
  protected async isDistrictMatch(_districtsMatched: ParisDistrictItem[], rangeRent: BordeauxEncadrementItem): Promise<boolean> {
    // from json-data/encadrements_bordeaux_2024.json
    // Zone 4 is the cheapest zone of bordeaux
    return rangeRent.zone === 4
  }
}
