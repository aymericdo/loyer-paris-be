import { GeojsonFile } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import * as fs from 'fs'
import path from 'path'
import { Memoize } from 'typescript-memoize'

interface DistrictElem {
  value: string
  groupBy: string | null
  displaySequence: number
}

export const DISPLAY_ZONE_FIELD = 'displayZone'
export const DISTRICT_FIELD = `properties.${DISPLAY_ZONE_FIELD}`

export const CITY_FILE_PATHS = {
  paris: 'json-data/quartier_paris.geojson',
  lille: 'json-data/quartier_lille.geojson',
  plaineCommune: 'json-data/quartier_plaine-commune.geojson',
  estEnsemble: 'json-data/quartier_est-ensemble.geojson',
  lyon: 'json-data/quartier_lyon.geojson',
  montpellier: 'json-data/quartier_montpellier.geojson',
  bordeaux: 'json-data/quartier_bordeaux.geojson',
}

export class DistrictsList {
  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  @Memoize()
  currentGeodata(): GeojsonFile {
    const file = this.geodataFile()
    return {
      ...file,
      features: file.features.map((data) => ({
        ...data,
        properties: {
          ...data.properties,
          [DISPLAY_ZONE_FIELD]: this.zoneByCity(data),
        },
      })),
    }
  }

  currentPolygon(displayZoneField: string) {
    return this.currentGeodata().features.find((feature) => {
      return feature.properties[DISPLAY_ZONE_FIELD] === displayZoneField
    })?.geometry
  }

  currentGeodataWithGroupBy() {
    return this.currentGeodata()
      .features.reduce((prev: DistrictElem[], data) => {
        switch (this.city) {
          case 'paris': {
            if (!prev.some((elem: DistrictElem) => elem.value === data['properties']['l_qu'])) {
              prev.push({
                value: data['properties']['l_qu'],
                displaySequence: data['properties']['c_ar'],
                groupBy: `${data['properties']['c_ar']}${(data['properties']['c_ar'] > 1
                  ? 'ème'
                  : 'er'
                ).toString()} arrondissement`,
              })
            }
            break
          }
          default: {
            if (!prev.some((elem: DistrictElem) => elem.value === this.zoneByCity(data))) {
              prev.push({
                value: this.zoneByCity(data),
                displaySequence: data['properties'][DISPLAY_ZONE_FIELD],
                groupBy: null,
              })
            }
            break
          }
        }

        return prev
      }, [])
      .sort((a: DistrictElem, b: DistrictElem) => {
        return a.displaySequence > b.displaySequence ? 1 : -1
      })
  }

  private zoneByCity(data) {
    switch (this.city) {
      case 'paris':
        return data['properties']['l_qu']
      case 'lille':
      case 'lyon':
      case 'plaineCommune':
      case 'estEnsemble':
      case 'montpellier':
      case 'bordeaux':
        return `Zone ${data['properties']['Zone']}`
    }
  }

  private geodataFile() {
    return JSON.parse(fs.readFileSync(path.join(CITY_FILE_PATHS[this.city]), 'utf8'))
  }
}
