import { ApiErrorsService } from '@services/api/errors'
import { getClassicData } from '@services/db/queries/get-classic-data'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export function getPriceVariation(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} priceVariation`, 'blue')
  const mainCity = req.params.city as AvailableMainCities
  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]
  getClassicData(mainCity, dateRange, { isLegal: false }, { createdAt: 1, maxPrice: 1, priceExcludingCharges: 1 })
    .then((data) => {
      const vegaOpt = Vega.commonOpt()
      const vegaMap = {
        ...vegaOpt,
        title: {
          ...vegaOpt.title,
          text: 'Différence moyenne (lissée) entre prix pratiqué et prix maximum estimé',
        },
        data: {
          values: data,
        },
        transform: [
          {
            timeUnit: 'yearweekday',
            field: 'createdAt',
            as: 'date',
          },
          {
            calculate: 'datum.priceExcludingCharges - datum.maxPrice',
            as: 'priceDifference',
          },
          {
            loess: 'priceDifference',
            on: 'date',
          },
        ],
        layer: [
          {
            mark: {
              type: 'line',
              color: '#fdcd56',
              tooltip: true,
              size: 4,
            },
            encoding: {
              y: {
                field: 'priceDifference',
                type: 'quantitative',
                title: 'Différence moyenne (€)',
              },
              x: {
                field: 'date',
                title: 'Date',
                type: 'temporal',
              },
            },
          },
          {
            mark: { type: 'point', fill: '#fff' },
            transform: [{ filter: { param: 'hover', empty: false } }],
            encoding: {
              x: { field: 'date', type: 'temporal' },
              color: { value: '#fff' },
              y: { field: 'priceDifference', type: 'quantitative' },
            },
          },
          {
            mark: 'rule',
            encoding: {
              x: { field: 'date', type: 'temporal' },
              opacity: {
                condition: { value: 0.4, param: 'hover', empty: false },
                value: 0,
              },
              color: { value: '#fff' },
              tooltip: [
                {
                  field: 'priceDifference',
                  title: 'Différence moyenne ',
                  type: 'quantitative',
                  format: '$.2f',
                },
                {
                  field: 'date',
                  title: 'Date ',
                  type: 'temporal',
                },
              ],
            },
            params: [
              {
                name: 'hover',
                select: {
                  type: 'point',
                  fields: ['date'],
                  nearest: true,
                  on: 'mouseover',
                  clear: 'mouseout',
                },
              },
            ],
          },
        ],
      }

      res.json(vegaMap)
    })
    .catch((err) => {
      const status = new ApiErrorsService(err).getStatus()
      res.status(status).json(err)
    })
}
