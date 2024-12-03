import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'
import { getClassicData } from '@services/db/queries/get-classic-data'
import { PostalCodeService } from '@services/diggers/postal-code-service'
import { isMainCityValid } from '@services/api/validations'

export async function getPriceDifference(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} priceDifference`, 'blue')

  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  isMainCityValid(res, mainCity, true)

  const postalCodePossibilities = new PostalCodeService(mainCity, 'all').getPostalCodePossibilities()

  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]

  const data = await getClassicData(mainCity, dateRange,
    { postalCode: { $exists: true }, isLegal: false },
    { maxPrice: 1, postalCode: 1, priceExcludingCharges: 1 })
  if (!data.length) {
    res.status(403).json({ message: 'not_enough_data' })
    return
  }

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
}
