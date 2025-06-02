import { Rent } from '@db/db'
import { getMainCityFilter, getDateRangeFilter, getClassicFilter } from '@services/db/queries/common'
import { AvailableMainCities } from '@services/city-config/list'

export async function getLegalPerDistrict(
  city: AvailableMainCities,
  dateRange: [string, string] | null = null,
): Promise<{ illegalPercentage: number, isIllegalCount: number, totalCount: number, district: string }[]> {
  const filter = {
    ...getClassicFilter(),
    ...getMainCityFilter(city),
    ...getDateRangeFilter(dateRange),
  }

  const aggregation = [
    {
      $match: filter,
    },
    {
      $group: {
        _id: '$district',
        isIllegalCount: {
          $sum: {
            $cond: [
              { $eq: ['$isLegal', false] },
              1,
              0
            ]
          }
        },
        totalCount: {
          $sum: 1
        },
      },
    },
    {
      $project: {
        _id: 0,
        district: '$_id',
        isIllegalCount: 1,
        totalCount: 1
      }
    },
    {
      $addFields: {
        illegalPercentage: {
          $multiply: [
            {
              $divide: [
                '$isIllegalCount',
                '$totalCount'
              ]
            },
            100
          ]
        }
      }
    },
    {
      $match: {
        totalCount: { $gte: 10 }
      }
    }
  ]

  return (await Rent.aggregate(aggregation))
}
