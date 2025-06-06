import { getLegalPerClassicRenterData } from '@services/db/queries/get-legal-per-classic-renter'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export async function getLegalPerClassicRenter(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} isLegalPerClassicRenter`, 'blue')
  const mainCity = req.params.city as AvailableMainCities

  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]

  const plazaImmoData = await getLegalPerClassicRenterData(
    mainCity,
    dateRange,
    /plaza.*immobilier/i
  )
  const century21Data = await getLegalPerClassicRenterData(mainCity, dateRange, /century.*21/i)
  const fonciaData = await getLegalPerClassicRenterData(mainCity, dateRange, /foncia/i)
  const laforetData = await getLegalPerClassicRenterData(mainCity, dateRange, /laforet/i)
  const guyHoquetData = await getLegalPerClassicRenterData(mainCity, dateRange, /guy.*hoquet/i)
  const orpiData = await getLegalPerClassicRenterData(mainCity, dateRange, /orpi/i, 'orpi')

  const data = [
    ...plazaImmoData.map((d) => ({
      ...d,
      renter: 'Stéphane Plaza mmobilier',
    })),
    ...century21Data.map((d) => ({ ...d, renter: 'Century 21' })),
    ...fonciaData.map((d) => ({ ...d, renter: 'Foncia' })),
    ...laforetData.map((d) => ({ ...d, renter: 'Laforêt' })),
    ...guyHoquetData.map((d) => ({ ...d, renter: 'Guy Hoquet' })),
    ...orpiData.map((d) => ({ ...d, renter: 'Orpi' })),
  ]

  const vegaOpt = Vega.commonOpt()
  const vegaMap = {
    ...vegaOpt,
    title: {
      ...vegaOpt.title,
      text: 'Annonces non conformes par agence majeure',
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
