import { Vega } from '@services/helpers/vega'
import { Response, Request } from 'express'
import { PrettyLog } from '@services/helpers/pretty-log'
import * as rentService from '@db/rent.service'
import { DistrictsList } from '@services/districts/districts-list'
import { ERROR500_MSG } from '@services/api/errors'
import { AvailableMainCities } from '@services/address/city'

export function getMap(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getMap`, 'blue')
  const city: AvailableMainCities = req.params.city as AvailableMainCities
  const dateValue: string = req.query.dateValue as string
  const dateRange: string[] = dateValue?.split(',')
  const [geodata, districtField] = new DistrictsList(city as AvailableMainCities).currentGeodataWithZonage()

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
        PrettyLog.call(ERROR500_MSG, 'red')
        res.status(500).json(err)
      }
    })
}
