import { vegaCommonOpt } from '@helpers/vega'
import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'
import { DistrictsList } from '@services/districts'

export function getMap(req: Request, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')
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
            zonage: `Zone ${data['properties']['Zone']}`,
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
    .getMapData(city, dateRange)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        layer: [
          {
            data: {
              format: { type: 'json', property: 'features' },
              values: geodata,
            },
            projection: { type: 'mercator' },
            mark: {
              type: 'geoshape',
              fill: 'lightgray',
              stroke: 'white',
            },
            encoding: {
              tooltip: { field: districtField, type: 'nominal' },
            },
          },
          {
            data: {
              values: data,
            },
            transform: [
              { calculate: "datum.isLegal ? 'Oui' : 'Non'", as: 'isLegal' },
            ],
            encoding: {
              longitude: {
                field: 'longitude',
                type: 'quantitative',
              },
              latitude: {
                field: 'latitude',
                type: 'quantitative',
              },
              tooltip: { field: 'district', type: 'nominal' },
              color: {
                field: 'isLegal',
                title: 'Est conforme ?',
                type: 'nominal',
                scale: {
                  range: ['red', 'green'],
                },
              },
            },
            mark: {
              type: 'circle',
              color: 'red',
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
