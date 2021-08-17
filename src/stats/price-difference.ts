import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'
import { cityList } from '@services/address/city'

export function getPriceDifference(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} priceDifference`, 'blue')
  const postalCodePossibilities =
    req.params.city === 'paris'
      ? cityList.paris.postalCodePossibilities
      : cityList.lille.postalCodePossibilities
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  rentService
    .getPriceDiffData(req.params.city, dateRange)
    .then((data) => {
      const vegaOpt = vegaCommonOpt()
      const vegaMap = {
        ...vegaOpt,
        title: {
          ...vegaOpt.title,
          text: 'Différence moyenne entre le prix pratiqué et le prix maximum estimé',
        },
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          {
            calculate: 'datum.priceExcludingCharges - datum.maxPrice',
            as: 'priceDifference',
          },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'postalCode',
                as: 'countOfPostalCode',
              },
            ],
            groupby: ['postalCode'],
          },
        ],
        encoding: {
          x: {
            field: 'postalCode',
            type: 'ordinal',
            title: 'Code postal',
            sort: postalCodePossibilities,
          },
          y: {
            aggregate: 'average',
            field: 'priceDifference',
            type: 'quantitative',
            title: 'Différence moyenne (€)',
          },
          tooltip: [
            { field: 'countOfPostalCode', title: "Nombre d'annonces " },
            {
              aggregate: 'average',
              field: 'priceDifference',
              title: 'Différence de prix ',
              type: 'quantitative',
              format: '$.2f',
            },
          ],
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
