import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getLegalPerRenter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerRenter`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  rentService
    .getLegalPerRenterData(req.params.city, dateRange)
    .then((data) => {
      const vegaOpt = vegaCommonOpt()
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
              field: 'numberIllegal',
              title: "Nombre d'annonces ",
              type: 'nominal',
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
