import { Vega } from '@services/vega'
import { Response, Request } from 'express'
import { PrettyLog } from '@services/pretty-log'
import * as rentService from '@db/rent.service'
import { cityList } from '@services/address/city'
import { ERROR500_MSG } from '@services/api-errors'

export function getPriceDifference(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} priceDifference`, 'blue')
  let postalCodePossibilities = []
  switch (req.params.city) {
    case 'paris':
      postalCodePossibilities = cityList.paris.postalCodePossibilities
      break
    case 'lille':
      postalCodePossibilities = cityList.lille.postalCodePossibilities
      break
    case 'plaine_commune':
      postalCodePossibilities = cityList.plaineCommune.postalCodePossibilities
      break
    case 'lyon':
      postalCodePossibilities = cityList.lyon.postalCodePossibilities
      break
  }

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
      console.error(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        PrettyLog.call(ERROR500_MSG, 'red')
        res.status(500).json(err)
      }
    })
}
