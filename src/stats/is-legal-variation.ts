import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'

export function getIsLegalVariation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalVariation`, 'blue')

  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')
  const districtValues: string = req.query.districtValues as string
  const furnishedValue = req.query.furnishedValue as string
  const surfaceValue: string = req.query.surfaceValue as string
  const roomValue: string = req.query.roomValue as string
  const isParticulierValue: string = req.query.isParticulier as string

  const districtList: string[] = districtValues
    ?.split(',')
    ?.map((v) => v)
    .filter(Boolean)
  const surfaceRange: number[] = surfaceValue?.split(',')?.map((v) => +v)
  const roomRange: number[] = roomValue?.split(',')?.map((v) => +v)
  const hasFurniture: boolean =
    furnishedValue === 'furnished'
      ? true
      : furnishedValue === 'nonFurnished'
      ? false
      : null

  const isParticulier =
    isParticulierValue.toLowerCase() === 'true'
      ? true
      : isParticulierValue.toLowerCase() === 'false'
      ? false
      : null

  rentService
    .getLegalVarData(
      req.params.city,
      districtList,
      surfaceRange,
      roomRange,
      hasFurniture,
      dateRange,
      isParticulier
    )
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        transform: [
          { timeUnit: 'yearweek', field: 'createdAt', as: 'date' },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'id',
                as: 'numberAds',
              },
            ],
            groupby: ['date'],
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
            groupby: ['date'],
          },
          {
            calculate: 'datum.numberIllegal / datum.numberAds * 100',
            as: 'percentOfTotal',
          },
        ],
        layer: [
          {
            mark: {
              type: 'line',
              color: '#f03434',
              tooltip: true,
              size: 2,
            },
            encoding: {
              y: {
                field: 'percentOfTotal',
                type: 'quantitative',
                title: 'Pourcentage',
              },
              x: {
                field: 'date',
                title: 'Date',
                type: 'temporal',
              },
            },
          },
          {
            mark: { type: 'line', color: '#fdcd56', tooltip: true, size: 5 },
            transform: [{ loess: 'percentOfTotal', on: 'date' }],
            encoding: {
              y: {
                field: 'percentOfTotal',
                type: 'quantitative',
                title: 'Pourcentage lissé',
              },
              x: {
                field: 'date',
                title: 'Date',
                type: 'temporal',
              },
            },
          },
        ],
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
