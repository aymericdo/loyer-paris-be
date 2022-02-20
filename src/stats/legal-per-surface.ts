import { Vega } from '@services/vega'
import { Response, Request } from 'express'
import { PrettyLog } from '@services/pretty-log'
import * as rentService from '@db/rent.service'
import { ERROR500_MSG } from '@services/api-errors'

export function getLegalPerSurface(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} isLegalPerSurface`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  rentService
    .getLegalPerSurfaceData(req.params.city, dateRange)
    .then((data) => {
      const vegaOpt = Vega.commonOpt()
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
      console.error(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        PrettyLog.call(ERROR500_MSG, 'red')
        res.status(500).json(err)
      }
    })
}
