import { Rent } from '@db/db'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { getMainCityFilter } from '@services/db/queries/common'

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
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 7))

  const filter = {
    isLegal: false,
    createdAt: { $gte: minDate },
    $expr: {
      $gte: [{ $subtract: ['$priceExcludingCharges', '$maxPrice'] }, maxDelta],
    },
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
