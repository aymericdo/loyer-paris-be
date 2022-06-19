import { Vega } from '@services/helpers/vega'
import { Response, Request } from 'express'
import { PrettyLog } from '@services/helpers/pretty-log'
import * as rentService from '@db/rent.service'
import { DistrictsList } from '@services/districts/districts-list'
import { ERROR500_MSG } from '@services/api/errors'
import { AvailableMainCities } from '@services/address/city'

export function getChloroplethMap(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getChloroplethMap`, 'blue')
  const city: AvailableMainCities = req.params.city as AvailableMainCities
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')
  const [geodata, districtField] = new DistrictsList(city as AvailableMainCities).currentGeodataWithZonage()

  rentService
    .getChloroplethMapData(city, dateRange)
    .then((data) => {
      const reduced: {
        [district: string]: { isLegal: number; count: number };
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
          values: geodata,
        },
        transform: [
          {
            lookup: districtField,
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
      console.error(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        PrettyLog.call(ERROR500_MSG, 'red')
        res.status(500).json(err)
      }
    })
}