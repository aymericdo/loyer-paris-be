import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { ApiErrorsService } from '@services/api/errors'
import { DISTRICT_FIELD, DistrictsList } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'
import rewind from '@mapbox/geojson-rewind'
import { getLegalPerDistrict } from '@services/db/queries/get-legal-per-district'
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

  getLegalPerDistrict(city, dateRange)
    .then((result: { illegalPercentage: number, isIllegalCount: number, totalCount: number, district: string }[]) => {
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
            lookup: DISTRICT_FIELD,
            from: {
              data: {
                values: result,
              },
              key: 'district',
              fields: ['illegalPercentage', 'isIllegalCount', 'district', 'totalCount'],
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
    })
    .catch((err) => {
      const status = new ApiErrorsService(err).getStatus()
      res.status(status).json(err)
    })
}
