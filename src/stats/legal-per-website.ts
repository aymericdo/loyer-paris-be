import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getLegalPerWebsite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getLegalPerWebsite`, 'blue')
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')

  rentService
    .getLegalPerWebsiteData(req.params.city, dateRange)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          { filter: 'datum.website != null' },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'id',
                as: 'numberAds',
              },
            ],
            groupby: ['website'],
          },
          { filter: 'datum.isLegal === false' },
          { filter: 'datum.numberAds > 5' },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'isLegal',
                as: 'numberIllegal',
              },
            ],
            groupby: ['website'],
          },
          {
            calculate: 'datum.numberIllegal / datum.numberAds * 100',
            as: 'percentOfTotal',
          },
        ],
        encoding: {
          x: {
            field: 'website',
            title: 'Site',
            type: 'nominal',
            sort: '-y',
          },
          y: {
            aggregate: 'mean',
            field: 'percentOfTotal',
            title: 'Annonces non conformes (%)',
            type: 'quantitative',
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
