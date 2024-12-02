import { Rent } from '@db/db'
import { getMainCityFilter, getDateRangeFilter, getClassicFilter } from '@services/db/queries/common'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export async function getClassicData(
  city: AvailableMainCities,
  dateRange: [string, string] = null,
  moreFilter: object = {},
  selector: object = {}
): Promise<object[]> {
  const filter = {
    ...getClassicFilter(),
    ...getMainCityFilter(city),
    ...getDateRangeFilter(dateRange),
    ...moreFilter
  }

  return (await Rent.find(filter, selector))
}