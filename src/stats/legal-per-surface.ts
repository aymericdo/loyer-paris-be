import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getLegalPerSurface(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerSurface`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  rentService
    .getLegalPerSurfaceData(req.params.city, dateRange)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          { calculate: "datum.isLegal ? 'Oui' : 'Non'", as: 'isLegal' },
        ],
        encoding: {
          x: {
            bin: {
              step: 5,
            },
            field: 'surface',
            title: 'Surface',
            type: 'quantitative',
          },
          y: {
            aggregate: 'count',
            field: 'isLegal',
            title: 'Annonces',
            type: 'quantitative',
          },
          color: {
            field: 'isLegal',
            title: 'Est conforme ?',
            type: 'nominal',
            scale: {
              range: ['red', 'green'],
            },
          },
        },
      }

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
