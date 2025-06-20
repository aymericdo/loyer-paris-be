import { DISPLAY_MAIN_CITY_FIELD } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Vega } from '@services/helpers/vega'
import { Request, Response } from 'express'
import rewind from '@mapbox/geojson-rewind'
import {
  getMainCityList,
  label,
  coordinates,
  isFake,
} from '@services/city-config/city-selectors'
import * as fs from 'fs'
import * as path from 'path'
import { kebabize } from '@services/helpers/kebabize'

const mapFranceGeojson = JSON.parse(
  fs.readFileSync(
    path.join('src/services/stats', 'map-france.geojson'),
    'utf8',
  ),
)

export async function getMapFrance(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getMapFrance`, 'blue')

  const today = new Date()
  const severalYearsAgo = new Date()
  severalYearsAgo.setFullYear(today.getFullYear() - 4)

  const cities = getMainCityList()

  const geodata = {
    type: 'FeatureCollection',
    features: [mapFranceGeojson],
  }

  const vegaMap = {
    ...Vega.commonOpt(),
    layer: [
      {
        data: {
          format: { type: 'json', property: 'features' },
          values: rewind(geodata, true),
        },
        projection: {
          type: 'mercator',
        },
        mark: {
          type: 'geoshape',
        },
        transform: [
          {
            calculate: `datum.properties.${DISPLAY_MAIN_CITY_FIELD}`,
            as: 'displayMainCity',
          },
        ],
        encoding: {
          color: {
            field: 'properties.isFake',
            type: 'nominal',
            scale: {
              domain: [true, false],
              range: ['orange', 'green'],
            },
          },
          stroke: {
            condition: {
              test: "datum.displayMainCity === ''",
              value: 'white',
            },
            value: null,
          },
        },
      },
      {
        data: {
          values: cities.map((city) => {
            let [lat, lon] = coordinates(city)
            if (city === 'plaineCommune') {
              lat += 0.2 // vers le nord
            }
            if (city === 'estEnsemble') {
              lon += 0.2 // vers l'est
            }
            const fake = isFake(city)
            return {
              name: label(city),
              isFake: fake,
              lon,
              lat,
              priority: ['plaineCommune', 'estEnsemble'].includes(city)
                ? 'low'
                : '',
              url: fake
                ? ''
                : `https://encadrement-loyers.fr/stats/${kebabize(city)}`,
            }
          }),
        },
        projection: { type: 'mercator' },
        mark: {
          type: 'point',
          shape: 'circle',
          size: 800,
          filled: true,
          color: 'white',
          tooltip: true,
          cursor: 'pointer',
          opacity: 0.8,
          stroke: 'black',
          strokeWidth: 1,
        },
        selection: {
          highlight: {
            type: 'single',
            on: 'mouseover',
            empty: 'none',
          },
        },
        encoding: {
          longitude: { field: 'lon', type: 'quantitative' },
          latitude: { field: 'lat', type: 'quantitative' },
          tooltip: { field: 'name', type: 'nominal' },
          href: { field: 'url' },
          color: {
            field: 'isFake',
            type: 'nominal',
            scale: {
              domain: [true, false],
              range: ['orange', 'green'],
            },
            legend: {
              title: 'Zones tendues',
              labelExpr:
                "datum.label === 'false' ? 'Encadrement appliqué' : datum.label === 'true' ? 'Encadrement simulé' : ''",
            },
          },
          size: {
            condition: [
              {
                test: "datum.priority === 'low'",
                value: 300,
              },
              {
                selection: 'highlight',
                value: 1000,
              },
            ],
            value: 800,
          },
        },
      },
    ],
  }
  res.json(vegaMap)
}
