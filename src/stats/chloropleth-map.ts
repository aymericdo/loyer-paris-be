import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'
import { DistrictsList } from '@services/districts'

export function getChloroplethMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getChloroplethMap`, 'blue')
  const city = req.params.city
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')
  const districtList = new DistrictsList()

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
    case 'plaine_commune':
      geodata = {
        ...districtList.plaineCommuneGeodata(),
        features: districtList.plaineCommuneGeodata().features.map((data) => ({
          ...data,
          properties: {
            ...data.properties,
            Zone: `Zone ${data['properties']['Zone']}`,
          },
        })),
      }
      districtField = 'properties.Zone'
      break
    case 'lyon':
      geodata = {
        ...districtList.lyonGeodata(),
        features: districtList.lyonGeodata().features.map((data) => ({
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
          totalCount: value.count,
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
              title: "Nombre d'annonces ",
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
