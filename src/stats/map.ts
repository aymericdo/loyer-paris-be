import { Vega } from '@services/vega';
import { Response, Request } from 'express';
import { PrettyLog } from '@services/pretty-log';
import * as rentService from '@db/rent.service';
import { DistrictsList } from '@services/districts';
import { ERROR500_MSG } from '@services/api-errors';

export function getMap(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getMap`, 'blue');
  const city = req.params.city
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',');
  const districtList = new DistrictsList()

  let geodata: any
  let districtField: string
  switch (city) {
    case 'paris':
      geodata = districtList.parisGeodata()
      districtField = 'properties.l_qu';
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

      districtField = 'properties.zonage';
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

      districtField = 'properties.Zone';
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

      districtField = 'properties.zonage';
      break
  }

  rentService
    .getMapData(city, dateRange)
    .then((data) => {
      const vegaMap = {
        ...Vega.commonOpt(),
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
              { calculate: 'datum.isLegal ? \'Oui\' : \'Non\'', as: 'isLegal' },
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
      console.error(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        PrettyLog.call(ERROR500_MSG, 'red');
        res.status(500).json(err)
      }
    })
}
