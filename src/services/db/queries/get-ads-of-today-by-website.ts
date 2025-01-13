import { Rent } from '@db/db'
import { getClassicWebsiteFilter, getDateRangeFilter } from '@services/db/queries/common'

export async function getAdsOfTodayByWebsite(): Promise<{
  website: string, count: number
}[]> {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 1))

  const aggregation = [
    {
      $match: {
        ...getClassicWebsiteFilter(),
        createdAt: { $gte: minDate },
      },
    },
    {
      $group: {
        _id: { website: '$website' },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        website: '$_id.website',
        count: 1,
      }
    }
  ]

  return (await Rent.aggregate(aggregation))
}

export async function getAdsOfWeekByWebsite(): Promise<{
  website: string, count: number
}[]> {
  const today = new Date()
  const precedentDate = new Date()
  precedentDate.setDate(precedentDate.getDate() - 7)

  const aggregation = [
    {
      $match: {
        ...getClassicWebsiteFilter(),
        ...getDateRangeFilter([precedentDate.toISOString(), today.toISOString()]),
      },
    },
    {
      $group: {
        _id: { website: '$website' },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        website: '$_id.website',
        count: 1,
      }
    }
  ]

  return (await Rent.aggregate(aggregation))
}
