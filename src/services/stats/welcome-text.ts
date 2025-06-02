import { getClassicData } from '@services/db/queries/get-classic-data'
import { AvailableMainCities } from '@services/city-config/list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'

export async function getWelcomeText(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getWelcomeText`, 'blue')

  const mainCity: AvailableMainCities & 'all' = req.params.city as AvailableMainCities & 'all'

  const rents = await getClassicData(mainCity, null, {}, { isLegal: 1, surface: 1 }) as { isLegal: boolean; surface: number }[]

  const isIllegalPercentage = Math.round((100 * rents.filter((rent) => !rent.isLegal).length) / rents.length)

  const pivotSurface = 30
  const lessThanNSquareMeters = rents.filter((rent) => rent.surface < pivotSurface)
  const isIllegalPercentageUnderPivot = Math.round(
    (100 * lessThanNSquareMeters.filter((rent) => !rent.isLegal).length) / lessThanNSquareMeters.length
  )

  res.json({
    numberRents: rents.length,
    pivotSurface: pivotSurface,
    isIllegalPercentage,
    isIllegalPercentageUnderPivot
  })
}
