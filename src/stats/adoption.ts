import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getAdoptionRate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} adoption`, 'blue')

  rentService
    .getAdoptionData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'line', tooltip: true, interpolate: 'monotone' },
        transform: [
          {
            sort: [{ field: 'createdAt' }],
            window: [{ op: 'count', field: 'count', as: 'cumulative_count' }],
            frame: [null, 0],
          },
        ],
        encoding: {
          x: {
            field: 'createdAt',
            title: 'Date',
            type: 'temporal',
            timeUnit: 'yearmonthdate',
          },
          y: {
            field: 'cumulative_count',
            title: "Nombre d'annonces",
            type: 'quantitative',
          },
        },
      }
      vegaMap.config['mark'] = { color: '#FBC652' }

      res.json(vegaMap)
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
