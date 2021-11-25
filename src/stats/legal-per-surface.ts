import { vegaCommonOpt } from '@helpers/vega'
import { Response, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getLegalPerSurface(
  req: Request,
  res: Response,
  
) {
  log.info(`-> ${req.baseUrl} isLegalPerSurface`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  rentService
    .getLegalPerSurfaceData(req.params.city, dateRange)
    .then((data) => {
      const vegaOpt = vegaCommonOpt()
      const vegaMap = {
        ...vegaOpt,
        title: {
          ...vegaOpt.title,
          text: 'Annonces non conformes par surface',
        },
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          { calculate: 'datum.isLegal ? \'Oui\' : \'Non\'', as: 'isLegal' },
        ],
        encoding: {
          x: {
            bin: {
              step: 5,
            },
            field: 'surface',
            title: 'Surface (m²) ',
            type: 'quantitative',
          },
          y: {
            aggregate: 'count',
            field: 'isLegal',
            title: 'Nombre d\'annonces ',
            type: 'quantitative',
          },
          color: {
            field: 'isLegal',
            title: 'Est conforme ',
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
