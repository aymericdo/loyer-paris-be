import { InfoToFilter } from '@interfaces/ad'
import { lastDateBuiltRange } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FilterParent } from '@services/filters/encadrement-filter/filter-parent'

export class GenericFilter extends FilterParent {
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', 'apres 1990']

  constructor(
    mainCity: AvailableMainCities,
    criteriaJsonPath: string,
    infoToFilter: InfoToFilter,
  ) {
    super(infoToFilter)
    this.mainCity = mainCity
    this.criteriaJsonPath = criteriaJsonPath

    if (lastDateBuiltRange(this.mainCity) === 2005) {
      this.rangeTime = ['avant 1946', '1946-1970', '1971-1990', '1991-2005', 'apres 2005']
    }
  }
}
