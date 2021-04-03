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
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        transform: [
          {
            timeUnit: 'yearmonth',
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
            title:
              'Différence moyenne (lissée) entre prix pratiqué et prix maximum estimé (€)',
          },
          x: {
            field: 'date',
            title: 'Date',
            type: 'temporal',
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