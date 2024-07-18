import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { ApiErrorsService } from '@services/api/errors'
import { DISTRICT_FIELD, DistrictsList } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'
import rewind from '@mapbox/geojson-rewind'
import { getClassicData } from '@services/db/queries/get-classic-data'
import { isFake } from '@services/filters/city-filter/fake'

export async function getChloroplethMap(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getChloroplethMap`, 'blue')
  const city: AvailableMainCities = req.params.city as AvailableMainCities
  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]

  if (isFake(city)) {
    res.status(403).json({ message: 'City params not valid' })
    return
  }

  const geodata = await new DistrictsList(city as AvailableMainCities).currentGeodata()

  getClassicData(city, dateRange, {}, { isLegal: 1, district: 1 })
    .then((data: { isLegal: boolean, district: string }[]) => {
      const reduced: {
        [district: string]: { isLegal: number; count: number }
      } = data.reduce((m, d: { isLegal: boolean; district: string }) => {
        if (!m[d.district]) {
          m[d.district] = {
            count: 1,
            isLegal: d.isLegal ? 1 : 0,
          }
        } else {
          if (d.isLegal) {
            m[d.district].isLegal += 1
          }
          m[d.district].count += 1
        }
        return m
      }, {})

      const result = Object.keys(reduced).map((district: string) => {
        const value = reduced[district]
        return {
          district,
          isIllegal: Math.round((1 - value.isLegal / value.count) * 100),
          totalCount: value.count,
        }
      })

      const vegaMap = {
        ...Vega.commonOpt(),
        data: {
          format: { type: 'json', property: 'features' },
          values: rewind(geodata, true),
        },
        transform: [
          {
            lookup: DISTRICT_FIELD,
            from: {
              data: {
                values: result,
              },
              key: 'district',
              fields: ['isIllegal', 'district', 'totalCount'],
            },
          },
          {
            calculate: 'datum.isIllegal / 100',
            as: 'isIllegal0to1',
          },
        ],
        projection: {
          type: 'mercator',
        },
        mark: 'geoshape',
        encoding: {
          color: {
            field: 'isIllegal',
            type: 'quantitative',
            scale: { scheme: 'reds' },
            title: 'Non conformité (%)',
          },
          tooltip: [
            {
              field: 'isIllegal0to1',
              type: 'quantitative',
              title: 'Annonces non conformes ',
              format: '.0%',
            },
            {
              field: 'district',
              type: 'nominal',
              title: 'Quartier ',
            },
            {
              field: 'totalCount',
              type: 'quantitative',
              title: 'Nombre d\'annonces ',
            },
          ],
        },
      }
      res.json(vegaMap)
    })
    .catch((err) => {
      const status = new ApiErrorsService(err).getStatus()
      res.status(status).json(err)
    })
}
