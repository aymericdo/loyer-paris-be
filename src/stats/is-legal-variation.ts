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
  const isParticulierValue: string = req.query.isParticulierValue as string

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
      const vegaOpt = vegaCommonOpt()
      const vegaMap = {
        ...vegaOpt,
        title: {
          ...vegaOpt.title,
          text: 'Annonces non conformes au cours du temps',
        },
        padding: {
          ...vegaOpt.padding,
          top: 24,
        },
        data: {
          values: data,
        },
        transform: [
          { timeUnit: 'yearmonth', field: 'createdAt', as: 'date' },
          {
            mark: { type: 'line', color: '#f03434', tooltip: true, size: 1 },
            encoding: {
              x: { field: 'date', type: 'temporal' },
              y: {
                field: 'percentOfTotal',
                type: 'quantitative',
                title: "Pourcentage d'annonces non conformes (rouge)",
              },
            },
          },
          {
            transform: [
              {
                loess: 'percentOfTotal',
                on: 'date',
                bandwidth: 0.5,
                as: ['date', 'smoothPercentOfTotal'],
              },
            ],
            layer: [
              {
                mark: {
                  type: 'line',
                  color: '#fdcd56',
                  tooltip: true,
                  size: 4,
                },
                encoding: {
                  x: { field: 'date', type: 'temporal' },
                  y: {
                    field: 'smoothPercentOfTotal',
                    type: 'quantitative',
                    title: 'Pourcentage lissé (jaune) (%)',
                  },
                },
              },
              {
                mark: { type: 'point', fill: '#fff' },
                transform: [{ filter: { param: 'hover', empty: false } }],
                encoding: {
                  x: { field: 'date', type: 'temporal' },
                  color: { value: '#fff' },
                  y: { field: 'smoothPercentOfTotal', type: 'quantitative' },
                },
              },
              {
                mark: 'rule',
                transform: [
                  {
                    calculate: 'datum.smoothPercentOfTotal / 100',
                    as: 'smoothPercentOfTotal0to1',
                  },
                ],
                encoding: {
                  x: { field: 'date', type: 'temporal' },
                  opacity: {
                    condition: { value: 0.4, param: 'hover', empty: false },
                    value: 0,
                  },
                  color: { value: '#fff' },
                  tooltip: [
                    {
                      field: 'smoothPercentOfTotal0to1',
                      title: 'Pourcentage lissé ',
                      type: 'quantitative',
                      format: '.2%',
                    },
                    {
                      field: 'date',
                      title: 'Date ',
                      type: 'temporal',
                    },
                  ],
                },
                params: [
                  {
                    name: 'hover',
                    select: {
                      type: 'point',
                      fields: ['date'],
                      nearest: true,
                      on: 'mouseover',
                      clear: 'mouseout',
                    },
                  },
                ],
              },
            ],
          },
        ],
        transform: [
          { timeUnit: 'yearweekday', field: 'createdAt', as: 'date' },
          {
            joinaggregate: [{ op: 'count', field: 'id', as: 'numberAds' }],
            groupby: ['date'],
          },
          { filter: 'datum.isLegal === false' },
          {
            joinaggregate: [
              { op: 'count', field: 'isLegal', as: 'numberIllegal' },
            ],
            groupby: ['date'],
          },
          {
            calculate: 'datum.numberIllegal / datum.numberAds * 100',
            as: 'percentOfTotal',
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
