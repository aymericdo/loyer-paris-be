import { AvailableCities, AvailableMainCities, getCitiesFromMainCity } from '@services/city-config/list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'
import rewind from '@mapbox/geojson-rewind'
import { getLegalPerCity } from '@services/db/queries/get-legal-per-city'
import { label } from '@services/city-config/label'
import { CITY_PATH, DistrictsList } from '@services/districts/districts-list'

export async function getChloroplethCitiesMap(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getChloroplethCitiesMap`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities

  const dateValue: string = req.query.dateValue as string
  const dateRange: [string, string] = dateValue?.split(',').splice(0, 2) as [string, string]

  const cities = getCitiesFromMainCity(mainCity)
  if (cities.length === 1) {
    res.status(403).json({ message: 'City params not valid' })
    return
  }

  const geodata = await new DistrictsList(mainCity).currentGeodata()

  const result: { illegalPercentage: number, isIllegalCount: number, totalCount: number, city: string }[] =
    (await getLegalPerCity(mainCity, dateRange)).map((data) => ({
      ...data,
      city: label(data.city as AvailableCities),
    }))

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
        lookup: CITY_PATH,
        from: {
          data: {
            values: result,
          },
          key: 'city',
          fields: ['illegalPercentage', 'isIllegalCount', 'city', 'totalCount'],
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
          field: 'city',
          type: 'nominal',
          title: 'Ville ',
        },
        {
          field: 'isIllegalCount',
          type: 'quantitative',
          title: 'Nombre d\'annonces non conforme ',
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
}
