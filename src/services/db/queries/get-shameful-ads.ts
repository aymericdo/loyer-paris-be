import { Rent } from '@db/db'
import { AvailableMainCities } from '@services/city-config/main-cities'
import {
  getClassicWebsiteFilter,
  getMainCityFilter,
} from '@services/db/queries/common'

export async function getShamefulAdsData(
  city: AvailableMainCities,
  maxDelta = 200,
): Promise<
  {
    url: string
    website: string
    priceExcludingCharges: number
    maxPrice: number
  }[]
> {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const filter = {
    isLegal: false,
    createdAt: { $gte: startOfYesterday, $lt: startOfToday },
    $expr: {
      $gt: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, maxDelta],
    },
    ...getClassicWebsiteFilter(),
    ...getMainCityFilter(city as AvailableMainCities),
  }

  return await Rent.find(
    filter,
    {
      website: 1,
      priceExcludingCharges: 1,
      maxPrice: 1,
      url: 1,
    },
    {
      sort: { createdAt: -1 },
    },
  )
}
