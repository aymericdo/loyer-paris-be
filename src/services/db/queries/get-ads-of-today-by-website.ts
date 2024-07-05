import { Rent } from '@db/db'

export async function getAdsOfTodayByWebsite(): Promise<{
  [website: string]: number
}> {
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() - 1))

  return (
    (await Rent.aggregate([
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
    ]))
  ).reduce((prev, obj) => {
    prev[obj._id.website] = obj.count
    return prev
  }, {})
}
