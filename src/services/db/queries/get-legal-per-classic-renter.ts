import { Rent } from '@db/db'
import { getCityFilter, getClassicSurfaceFilter, getDateRangeFilter } from '@services/db/queries/common'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { FUNNIEST_WEBSITES } from '@services/websites/website'

export async function getLegalPerClassicRenterData(
  city: AvailableMainCities,
  dateRange: [string, string],
  renterNameRegex: RegExp,
  website?: string
): Promise<{ isLegal: boolean; renter: string }[]> {
  const filter = {
    ...getClassicSurfaceFilter(),
    ...getCityFilter(city),
    ...getDateRangeFilter(dateRange),
    ...(website ? {
      $or: [{ renter: { $regex: renterNameRegex } }, { website }]
    } : {
      renter: { $regex: renterNameRegex },
      website: { $nin: FUNNIEST_WEBSITES }
    })
  }

  return (await Rent.find(filter, {
    isLegal: 1,
    renter: 1,
  }).lean())
}