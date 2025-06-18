import { Rent } from '@db/db'
import { AvailableMainCities } from '@services/city-config/main-cities'
import {
  getMainCityFilter,
  getClassicSurfaceFilter,
  getDateRangeFilter,
} from '@services/db/queries/common'
import { FUNNIEST_WEBSITES } from '@services/websites/website'

export async function getLegalPerClassicRenterData(
  city: AvailableMainCities,
  dateRange: [string, string],
  renterNameRegex: RegExp,
  website?: string,
): Promise<{ isLegal: boolean; renter: string }[]> {
  const filter = {
    ...getClassicSurfaceFilter(),
    ...getMainCityFilter(city),
    ...getDateRangeFilter(dateRange),
    ...(website
      ? {
          $or: [{ renter: { $regex: renterNameRegex } }, { website }],
        }
      : {
          renter: { $regex: renterNameRegex },
          website: { $nin: FUNNIEST_WEBSITES },
        }),
  }

  return (await Rent.find(filter, {
    isLegal: 1,
    renter: 1,
  }).lean()) as { isLegal: boolean; renter: string }[]
}
