import { Rent } from '@db/db'
import { AvailableMainCities } from '@services/city-config/main-cities'
import {
  getMainCityFilter,
  getDateRangeFilter,
  getClassicFilter,
} from '@services/db/queries/common'

export async function getClassicData(
  city: AvailableMainCities,
  dateRange: [string, string] = null,
  moreFilter: object = {},
  selector: object = {},
): Promise<object[]> {
  const filter = {
    ...getClassicFilter(),
    ...getMainCityFilter(city),
    ...getDateRangeFilter(dateRange),
    ...moreFilter,
  }

  return await Rent.find(filter, selector)
}
