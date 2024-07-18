import { ApiErrorsService } from '@services/api/errors'
import { getLegalPerDate } from '@services/db/queries/get-legal-per-date'
import { AvailableCityZones, AvailableMainCities } from '@services/filters/city-filter/city-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'

export function getIsLegalVariation(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} isLegalVariation`, 'blue')

  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]
  const districtValues: string = req.query.districtValues as string
  const furnishedValue = req.query.furnishedValue as string
  const surfaceValue: string = req.query.surfaceValue as string
  const roomValue: string = req.query.roomValue as string
  const isParticulierValue: string = req.query.isParticulierValue as string

  const districtList: AvailableCityZones = districtValues
    ?.split(',')
    ?.map((v) => v)
    .filter(Boolean) as unknown as AvailableCityZones
  const surfaceRange: [number, number] = surfaceValue?.split(',')?.map((v) => +v).splice(0, 2) as [number, number]
  const roomRange: [number, number] = roomValue?.split(',')?.map((v) => +v).splice(0, 2) as [number, number]
  const hasFurniture: boolean = furnishedValue === 'furnished' ? true : furnishedValue === 'nonFurnished' ? false : null

  const isParticulier =
    isParticulierValue.toLowerCase() === 'true' ? true : isParticulierValue.toLowerCase() === 'false' ? false : null

  getLegalPerDate(mainCity, districtList, surfaceRange, roomRange, hasFurniture, dateRange, isParticulier)
    .then((data) => {
      const vegaOpt = Vega.commonOpt()
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
          {
            calculate: 'datum.illegalPercentage / 100',
            as: 'illegalPercentageDecimal'
          },
          {
            calculate: 'datetime(parseInt(split(datum.weekDate, \'-\')[0]), 0, 1 + (parseInt(split(datum.weekDate, \'-\')[1])-1)*7)',
            as: 'date'
          }
        ],
        layer: [
          {
            mark: {
              type: 'line',
              interpolate: 'monotone',
              color: '#fff',
              size: 1,
            },
            encoding: {
              x: { field: 'date', type: 'temporal', title: 'Semaine' },
              color: { 'value': '#fff' },
              y: {
                field: 'illegalPercentageDecimal',
                type: 'quantitative',
                title: 'Pourcentage illégal (%)',
                axis: { format: '.1%' }
              },
              tooltip: [
                {
                  field: 'date',
                  type: 'temporal',
                  format: 'Semaine %W-%Y',
                  title: 'Semaine'
                },
                {
                  field: 'illegalPercentageDecimal',
                  type: 'quantitative',
                  title: 'Pourcentage illégal',
                  format: '.1%'
                },
                { field: 'totalCount', type: 'quantitative', title: 'Total' }
              ]
            }
          },
          {
            mark: {
              type: 'line',
              interpolate: 'monotone',
              color: '#fdcd56',
              size: 4,
            },
            transform: [
              {
                loess: 'illegalPercentageDecimal',
                on: 'date',
                bandwidth: 0.4,
              }
            ],
            encoding: {
              x: {
                field: 'date',
                type: 'temporal',
                'axis': { format: 'Semaine %W-%Y' }
              },
              y: {
                field: 'illegalPercentageDecimal',
                type: 'quantitative',
              },
              tooltip: [
                {
                  field: 'date',
                  type: 'temporal',
                  format: 'Semaine %W-%Y',
                  title: 'Semaine'
                },
                {
                  field: 'illegalPercentageDecimal',
                  type: 'quantitative',
                  title: 'Pourcentage lissé',
                  format: '.1%'
                }
              ]
            }
          }
        ]
      }

      res.json(vegaMap)
    })
    .catch((err) => {
      const status = new ApiErrorsService(err).getStatus()
      res.status(status).json(err)
    })
}