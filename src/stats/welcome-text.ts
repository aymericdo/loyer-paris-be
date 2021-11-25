import { Response, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getWelcomeText(
  req: Request,
  res: Response,
  
) {
  log.info(`-> ${req.baseUrl} getWelcomeText`, 'blue')

  rentService
    .getWelcomeData()
    .then((data) => {
      const rents = data

      const isIllegalPercentage = Math.round(
        (100 * rents.filter((rent) => !rent.isLegal).length) / rents.length
      )

      const pivotSurface = 30
      const lessThanNSquareMeters = rents.filter(
        (rent) => rent.surface < pivotSurface
      )
      const isSmallSurfaceIllegalPercentage = Math.round(
        (100 * lessThanNSquareMeters.filter((rent) => !rent.isLegal).length) /
          lessThanNSquareMeters.length
      )

      return res.json({
        numberRents: rents.length,
        pivotSurface: pivotSurface,
        isIllegalPercentage,
        isSmallSurfaceIllegalPercentage,
      })
    })
    .catch((err) => {
      console.log(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        log.error('Error 500')
        res.status(500).json(err)
      }
    })
}
