import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'
import { DistrictList } from './districts'

export function getChloroplethMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getChloroplethMap`, 'blue')
  const city = req.params.city
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')
  const districtList = new DistrictList()

  let geodata: any
  let districtField: string
  switch (city) {
    case 'paris':
      geodata = districtList.parisGeodata()
      districtField = 'properties.l_qu'
      break
    case 'lille':
      geodata = {
        ...districtList.lilleGeodata(),
        features: districtList.lilleGeodata().features.map((data) => ({
          ...data,
          properties: {
            ...data.properties,
            zonage: `Zone ${data['properties']['zonage']}`,
          },
        })),
      }
      districtField = 'properties.zonage'
      break
  }

  rentService
    .getChloroplethMapData(city, dateRange)
    .then((data) => {
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
        }
      })

      const vegaMap = {
        ...vegaCommonOpt(),
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
              fields: ['isIllegal', 'district'],
            },
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
            title: 'Conformité (%)',
          },
          tooltip: [
            {
              field: 'isIllegal',
              type: 'quantitative',
              title: 'Annonces non conformes',
            },
            {
              field: 'district',
              type: 'nominal',
              title: 'Quartier',
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