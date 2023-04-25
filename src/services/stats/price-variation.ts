import * as rentService from '@db/rent.service'
import { ERROR500_MSG } from '@services/api/errors'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export function getPriceVariation(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} priceVariation`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')
  rentService
    .getPriceVarData(req.params.city, dateRange)
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
      console.error(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        PrettyLog.call(ERROR500_MSG, 'red')
        res.status(500).json(err)
      }
    })
}
