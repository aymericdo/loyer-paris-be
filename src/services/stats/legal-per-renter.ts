import { getClassicData } from '@services/db/queries/get-classic-data'
import { AvailableMainCities } from '@services/city-config/list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export async function getLegalPerRenter(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} isLegalPerRenter`, 'blue')

  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities

  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]

  const data = await getClassicData(mainCity, dateRange, { renter: { $exists: true } }, { isLegal: 1, renter: 1 })
  if (!data.length) {
    res.status(403).json({ message: 'not_enough_data' })
    return
  }

  const vegaOpt = Vega.commonOpt()
  const vegaMap = {
    ...vegaOpt,
    title: {
      ...vegaOpt.title,
      text: 'Annonces non conformes par agence (sans filtre)',
    },
    data: {
      values: data,
    },
    mark: { type: 'bar', tooltip: true },
    transform: [
      {
        joinaggregate: [
          {
            op: 'count',
            field: 'id',
            as: 'numberAds',
          },
        ],
        groupby: ['renter'],
      },
      { filter: 'datum.isLegal === false' },
      { filter: 'datum.numberAds > 10' },
      {
        joinaggregate: [
          {
            op: 'count',
            field: 'isLegal',
            as: 'numberIllegal',
          },
        ],
        groupby: ['renter'],
      },
      {
        calculate: 'datum.numberIllegal / datum.numberAds * 100',
        as: 'percentOfTotal',
      },
      {
        calculate: 'datum.percentOfTotal / 100',
        as: 'percentOfTotal0to1',
      },
    ],
    encoding: {
      x: {
        field: 'renter',
        title: 'Agence',
        type: 'nominal',
        sort: '-y',
      },
      y: {
        aggregate: 'mean',
        field: 'percentOfTotal',
        title: 'Annonces non conformes (%)',
        type: 'quantitative',
      },
      tooltip: [
        {
          field: 'percentOfTotal0to1',
          type: 'quantitative',
          title: 'Annonces non conformes ',
          format: '.2%',
        },
        { field: 'renter', title: 'Agence ', type: 'nominal' },
        {
          field: 'numberAds',
          title: 'Nombre total d\'annonces ',
          type: 'nominal',
        },
      ],
    },
  }

  res.json(vegaMap)
}
