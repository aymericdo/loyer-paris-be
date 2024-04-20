import * as rentService from '@db/rent.service'
import { ApiErrorsService } from '@services/api/errors'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

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
        transform: [{ calculate: 'datum.isLegal ? \'Oui\' : \'Non\'', as: 'isLegal' }],
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
      const status = new ApiErrorsService(err).getStatus()
      res.status(status).json(err)
    })
}
