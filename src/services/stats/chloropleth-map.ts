import { AvailableMainCities } from '@services/city-config/main-cities'
import { ZONE_PATH, DistrictsList } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'
import rewind from '@mapbox/geojson-rewind'
import { getLegalPerDistrict } from '@services/db/queries/get-legal-per-district'

export async function getChloroplethMap(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getChloroplethMap`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities

  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [
    string,
    string,
  ]

  const geodata = await new DistrictsList(
    mainCity as AvailableMainCities,
  ).currentGeodata()

  const result: {
    illegalPercentage: number
    isIllegalCount: number
    totalCount: number
    district: string
  }[] = await getLegalPerDistrict(mainCity, dateRange)

  if (!result.length) {
    res.status(403).json({ message: 'not_enough_data' })
    return
  }

  const vegaMap = {
    ...Vega.commonOpt(),
    data: {
      format: { type: 'json', property: 'features' },
      values: rewind(geodata, true),
    },
    transform: [
      {
        lookup: ZONE_PATH,
        from: {
          data: {
            values: result,
          },
          key: 'district',
          fields: [
            'illegalPercentage',
            'isIllegalCount',
            'district',
            'totalCount',
          ],
        },
      },
      {
        calculate: 'datum.illegalPercentage / 100',
        as: 'isIllegal0to1',
      },
    ],
    projection: {
      type: 'mercator',
    },
    mark: 'geoshape',
    encoding: {
      color: {
        field: 'illegalPercentage',
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
          field: 'isIllegalCount',
          type: 'quantitative',
          title: "Nombre d'annonces non conforme ",
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
}
