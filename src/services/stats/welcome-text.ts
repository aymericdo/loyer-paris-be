import * as rentService from '@db/rent.service'
import { ERROR500_MSG } from '@services/api/errors'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'

export function getWelcomeText(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getWelcomeText`, 'blue')
  const city = req.params.city

  rentService
    .getWelcomeData(city)
    .then((data) => {
      const rents = data

      const isIllegalPercentage = Math.round((100 * rents.filter((rent) => !rent.isLegal).length) / rents.length)

      const pivotSurface = 30
      const lessThanNSquareMeters = rents.filter((rent) => rent.surface < pivotSurface)
      const isSmallSurfaceIllegalPercentage = Math.round(
        (100 * lessThanNSquareMeters.filter((rent) => !rent.isLegal).length) / lessThanNSquareMeters.length
      )

      return res.json({
        numberRents: rents.length,
        pivotSurface: pivotSurface,
        isIllegalPercentage,
        isSmallSurfaceIllegalPercentage,
      })
    })
    .catch((err) => {
      console.error(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        PrettyLog.call(ERROR500_MSG, 'red')
        res.status(500).json(err)
      }
    })
}
