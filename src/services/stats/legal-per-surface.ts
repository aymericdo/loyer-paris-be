import { ApiErrorsService } from '@services/api/errors'
import { getClassicData } from '@services/db/queries/get-classic-data'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export function getLegalPerSurface(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} isLegalPerSurface`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]

  getClassicData(mainCity, dateRange, {}, { isLegal: 1, surface: 1 })
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
