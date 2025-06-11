import { Rent } from '@db/db'
import { AvailableCityZones } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { getMainCityFilter, getClassicWebsiteFilter, getDateRangeFilter, getDistrictFilter, getFurnitureFilter, getIsParticulierFilter, getRoomFilter, getSurfaceFilter } from '@services/db/queries/common'

function basicFilter(
  city: AvailableMainCities,
  districtList: AvailableCityZones,
  surfaceRange: [number, number],
  roomRange: [number, number],
  hasFurniture: boolean,
  dateRange: [string, string],
  isParticulier: boolean | null
) {
  const filter = {
    ...getClassicWebsiteFilter(),
    ...getMainCityFilter(city),
    ...getDateRangeFilter(dateRange),
    ...getDistrictFilter(districtList),
    ...getFurnitureFilter(hasFurniture),
    ...getSurfaceFilter(surfaceRange),
    ...getRoomFilter(roomRange),
    ...getIsParticulierFilter(isParticulier),
  }

  return filter
}

export async function getLegalPerDate(
  city: AvailableMainCities,
  districtList: AvailableCityZones,
  surfaceRange: [number, number],
  roomRange: [number, number],
  hasFurniture: boolean,
  dateRange: [string, string],
  isParticulier: boolean | null
): Promise<{
    weekDate: string
    isIllegalCount: number
    totalCount: number
    illegalPercentage: number
  }[]> {
  const filter = basicFilter(
    city,
    districtList,
    surfaceRange,
    roomRange,
    hasFurniture,
    dateRange,
    isParticulier
  )

  return await Rent.aggregate([
    {
      $match: filter
    },
    {
      $project: {
        isLegal: 1,
        weekDate: {
          $concat: [
            {
              $toString: { $year: '$createdAt' }
            },
            '-',
            { $toString: { $week: '$createdAt' } }
          ]
        },
      }
    },
    {
      $group: {
        _id: { weekDate: '$weekDate' },
        isIllegalCount: {
          $sum: {
            $cond: [
              { $eq: ['$isLegal', false] },
              1,
              0
            ]
          }
        },
        totalCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        weekDate: '$_id.weekDate',
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
    },
    { $sort: { weekDate: 1 } }
  ])
}
