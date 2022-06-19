import path from 'path'
import * as fs from 'fs'
import { AvailableMainCities } from '@services/address/city'
import { Memoize } from 'typescript-memoize'

interface DistrictElem {
  value: string;
  groupBy: string | null;
  displaySequence: number;
}

const DISPLAY_ZONE_FIELD = 'displayZone'
export const DISTRICT_FIELD = `properties.${DISPLAY_ZONE_FIELD}`

export const CITY_FILE_PATHS = {
  paris: 'json-data/quartier_paris_geodata.json',
  lille: 'json-data/quartier_lille_geodata.json',
  plaineCommune: 'json-data/quartier_plaine-commune_geodata.json',
  estEnsemble: 'json-data/quartier_est-ensemble_geodata.json',
  lyon: 'json-data/encadrements_lyon.json',
  montpellier: 'json-data/quartier_montpellier_geodata.json',
}

export class DistrictsList {
  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  @Memoize()
  currentGeodata() {
    const file = this.geodataFile()
    return {
      ...file,
      features: file.features.map((data) => ({
        ...data,
        properties: {
          ...data.properties,
          [DISPLAY_ZONE_FIELD]: this.zoneByCity(data),
        },
      }))
    }
  }

  currentGeodataWithGroupBy() {
    return this.currentGeodata().features
      .reduce((prev: DistrictElem[], data) => {
        switch (this.city) {
          case 'paris': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === data['properties']['l_qu']
              )
            ) {
              prev.push({
                value: data['properties']['l_qu'],
                displaySequence: data['properties']['c_ar'],
                groupBy: `${data['properties']['c_ar']}${(data['properties'][
                  'c_ar'
                ] > 1
                  ? 'ème'
                  : 'er'
                ).toString()} arrondissement`,
              })
            }
            break
          }
          default: {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === this.zoneByCity(data)
              )
            ) {
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
        return `Zone ${data['properties']['zonage']}`
      case 'plaineCommune':
      case 'estEnsemble':
      case 'montpellier':
        return `Zone ${data['properties']['Zone']}`
    }
  }

  private geodataFile() {
    return JSON.parse(
      fs.readFileSync(
        path.join(CITY_FILE_PATHS[this.city]),
        'utf8'
      )
    )
  }
}
