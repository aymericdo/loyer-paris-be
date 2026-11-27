import { Rent } from '@db/db'
import { AvailableMainCities } from '@services/city-config/main-cities'
import {
  getClassicWebsiteFilter,
  getMainCityFilter,
} from '@services/db/queries/common'

const HOUR_IN_MS = 60 * 60 * 1000
const LOOKBACK_IN_HOURS = 24

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
  const lookbackStart = new Date(Date.now() - LOOKBACK_IN_HOURS * HOUR_IN_MS)

  const filter = {
    isLegal: false,
    createdAt: { $gte: lookbackStart },
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
