import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getPriceVariation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} priceVariation`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')
  rentService
    .getPriceVarData(req.params.city, dateRange)
    .then((data) => {
      const vegaOpt = vegaCommonOpt()
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
      console.log(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        log.error('Error 500')
        res.status(500).json(err)
      }
    })
}
