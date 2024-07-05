import { FUNNIEST_WEBSITES } from '@services/websites/website'
import { getCityFilter, getDateRangeFilter } from '@services/db/queries/common'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { Rent } from '@db/db'

export async function getAdsWithCoordinates(
  city: AvailableMainCities,
  dateRange: [string, string]
): Promise<{ isLegal: boolean; latitude: number; longitude: number; district: string }[]> {
  const filter = {
    latitude: { $exists: true },
    longitude: { $exists: true },
    website: { $nin: FUNNIEST_WEBSITES },
    ...getCityFilter(city),
    ...getDateRangeFilter(dateRange),
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