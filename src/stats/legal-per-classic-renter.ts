import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export async function getLegalPerClassicRenter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerClassicRenter`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  try {
    const plazaImmoData = await rentService.getLegalPerClassicRenterData(
      req.params.city,
      dateRange,
      /plaza.*immobilier/
    )
    const century21Data = await rentService.getLegalPerClassicRenterData(
      req.params.city,
      dateRange,
      /century.*21/
    )
    const fonciaData = await rentService.getLegalPerClassicRenterData(
      req.params.city,
      dateRange,
      /foncia/
    )
    const laforetData = await rentService.getLegalPerClassicRenterData(
      req.params.city,
      dateRange,
      /laforet/
    )
    const guyHoquetData = await rentService.getLegalPerClassicRenterData(
      req.params.city,
      dateRange,
      /guy.*hoquet/
    )
    const orpiData = await rentService.getLegalPerClassicRenterData(
      req.params.city,
      dateRange,
      /orpi/
    )

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

    const vegaOpt = vegaCommonOpt()
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
        ],
      },
    }

    res.json(vegaMap)
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).json(err)
    } else {
      log.error('Error 500')
      res.status(500).json(err)
    }
  }
}
