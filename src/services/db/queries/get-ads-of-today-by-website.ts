import { Rent } from '@db/db'

export async function getAdsOfTodayByWebsite(): Promise<{
  website: string, count: number
}[]> {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 1))

  const aggregation = [
    {
      $match: { createdAt: { $gte: minDate } },
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
