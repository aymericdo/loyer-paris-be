import { FilteredResult } from '@interfaces/ad'
import { ParisDistrictItem, ParisEncadrementItem } from '@interfaces/paris'
import { FilterParis } from '@services/filters/encadrement-filter/filter-paris'

// FilterFakes is build to simulate what could happen for cities that are not applies Encadrement yet
// We are using Paris data, but with the cheaper district (because we consider the cheaper in Paris shouldn't be more expensive than others cities)
export class FilterFakes extends FilterParis {
  async find(): Promise<FilteredResult> {
    const rentList = await this.filter()

    // Get the cheap case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) => (prev.maxPrice < current.maxPrice ? prev : current))
      : null

    return worstCase
  }

  protected async isDistrictMatch(_districtsMatched: ParisDistrictItem[], _rangeRent: ParisEncadrementItem): Promise<boolean> {
    return true
  }
}
