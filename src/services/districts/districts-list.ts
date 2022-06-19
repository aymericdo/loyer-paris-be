import path from 'path'
import * as fs from 'fs'
import { AvailableMainCities } from '@services/address/city'

interface DistrictElem {
  value: string;
  groupBy: string | null;
  displaySequence: number;
}

export class DistrictsList {
  CITY_FILE_PATHS = {
    paris: 'json-data/quartier_paris_geodata.json',
    lille: 'json-data/quartier_lille_geodata.json',
    plaineCommune: 'json-data/quartier_plaine-commune_geodata.json',
    estEnsemble: 'json-data/quartier_est-ensemble_geodata.json',
    lyon: 'json-data/quartier_montpellier_geodata.json',
    montpellier: 'json-data/encadrements_lyon.json',
  }

  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  currentGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join(this.CITY_FILE_PATHS[this.city]),
        'utf8'
      )
    )
  }

  currentGeodataWithZonage() {
    let districtField = null
    let geodata = this.currentGeodata()

    switch (this.city) {
      case 'paris':
        districtField = 'properties.l_qu'
        break
      case 'lille':
      case 'lyon':
        geodata = {
          ...geodata,
          features: geodata.features.map((data) => ({
            ...data,
            properties: {
              ...data.properties,
              zonage: `Zone ${data['properties']['zonage']}`,
            },
          })),
        }

        districtField = 'properties.zonage'
        break
      case 'plaineCommune':
      case 'estEnsemble':
      case 'montpellier':
        geodata = {
          ...geodata,
          features: geodata.features.map((data) => ({
            ...data,
            properties: {
              ...data.properties,
              zonage: `Zone ${data['properties']['Zone']}`,
            },
          })),
        }

        districtField = 'properties.Zone'
        break
    }

    return [geodata, districtField]
  }

  currentGeodataWithGroupBy() {
    this.currentGeodata().features
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
          case 'lyon':
          case 'lille': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['zonage']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['zonage']}`,
                displaySequence: data['properties']['zonage'],
                groupBy: null,
              })
            }
            break
          }
          case 'plaineCommune':
          case 'montpellier':
          case 'estEnsemble': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['Zone']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['Zone']}`,
                displaySequence: data['properties']['Zone'],
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
}
