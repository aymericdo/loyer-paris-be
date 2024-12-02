import { getMainCityFilter, getDateRangeFilter, getWebsiteFilter } from '@services/db/queries/common'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { Rent } from '@db/db'

export async function getAdsWithCoordinates(
  city: AvailableMainCities,
  dateRange: [string, string]
): Promise<{ isLegal: boolean; latitude: number; longitude: number; district: string }[]> {
  const filter = {
    ...getMainCityFilter(city),
    ...getDateRangeFilter(dateRange),
    ...getWebsiteFilter(),
    latitude: { $exists: true },
    longitude: { $exists: true },
  }

  return (await Rent.find(filter, {
    isLegal: 1,
    latitude: 1,
    longitude: 1,
    district: 1,
  })) as unknown as {
      isLegal: boolean
      latitude: number
      longitude: number
      district: string
    }[]
}