import * as rentService from '@db/rent.service'
import { cityList } from '@services/filters/city-filter/valid-cities-list'
import { ApiErrorsService } from '@services/api/errors'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export function getPriceDifference(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} priceDifference`, 'blue')
  const postalCodePossibilities = Object.values(cityList)
    .filter((city) => city.mainCity === req.params.city)
    .flatMap((city) => city.postalCodePossibilities)

  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  rentService
    .getPriceDiffData(req.params.city, dateRange)
    .then((data) => {
      const vegaOpt = Vega.commonOpt()
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
            { field: 'countOfPostalCode', title: 'Nombre d\'annonces ' },
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
      const status = new ApiErrorsService(err).getStatus()
      res.status(status).json(err)
    })
}
