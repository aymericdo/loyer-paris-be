import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DISTRICT_FIELD, DistrictsList } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'
import rewind from '@mapbox/geojson-rewind'
import { getAdsWithCoordinates } from '@services/db/queries/get-ads-with-coordinates'

export async function getMap(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getMap`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities

  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').slice(0, 2) as [string, string]

  const geodata = await new DistrictsList(mainCity as AvailableMainCities).currentGeodata()

  const data = await getAdsWithCoordinates(mainCity, dateRange)
  const vegaMap = {
    ...Vega.commonOpt(),
    layer: [
      {
        data: {
          format: { type: 'json', property: 'features' },
          values: rewind(geodata, true),
        },
        projection: { type: 'mercator' },
        mark: {
          type: 'geoshape',
          fill: 'lightgray',
          stroke: 'white',
        },
        encoding: {
          tooltip: { field: DISTRICT_FIELD, type: 'nominal' },
        },
      },
      {
        data: {
          values: data,
        },
        transform: [{ calculate: 'datum.isLegal ? \'Oui\' : \'Non\'', as: 'isLegal' }],
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
}
