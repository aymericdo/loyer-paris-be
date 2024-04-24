import { DistrictItem, GeojsonFile } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities } from '@services/address/city'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import * as fs from 'fs'
import path from 'path'

interface DistrictElem {
  value: string
  groupBy: string | null
  displaySequence: number | string
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
  CurrentDistrictFilter = null
  mainCity: AvailableMainCities
  city: AvailableCities

  constructor(city: AvailableMainCities, options?: { specificCity?: AvailableCities }) {
    this.mainCity = city
    this.city = options?.specificCity
    this.CurrentDistrictFilter = new DistrictFilterFactory(this.mainCity).currentDistrictFilter()
  }

  async currentGeodata(): Promise<GeojsonFile> {
    const features: DistrictItem[] = await new this.CurrentDistrictFilter(
      { lat: null, lng: null },
      { city: this.city },
    ).getDistricts()

    return {
      type: 'FeatureCollection',
      features: features.map((data) => ({
        ...data,
        properties: {
          ...data.properties,
          [DISPLAY_ZONE_FIELD]: DistrictsList.digZoneInProperties(this.mainCity, data['properties']) as string,
        },
      })) as DistrictItem[],
    }
  }

  async currentFeature(displayZoneField: string): Promise<DistrictItem> {
    return await new this.CurrentDistrictFilter(
      { lat: null, lng: null },
      { city: this.city, districtName: displayZoneField },
    ).getFirstDistrict()
  }

  async currentGeodataWithGroupBy(): Promise<DistrictElem[]> {
    return ((await this.currentGeodata()).features as DistrictItem[]).reduce((prev: DistrictElem[], data) => {
      switch (this.city) {
        case 'paris': {
          if (!prev.some((elem: DistrictElem) => elem.value === data['properties']['l_qu'])) {
            prev.push({
              value: data['properties'][DISPLAY_ZONE_FIELD],
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
          if (!prev.some((elem: DistrictElem) => elem.value === data['properties'][DISPLAY_ZONE_FIELD])) {
            prev.push({
              value: data['properties'][DISPLAY_ZONE_FIELD],
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

  static digZoneInProperties(city: AvailableMainCities, data: unknown): string {
    switch (city) {
      case 'paris':
        return data['l_qu']
      case 'lille':
      case 'lyon':
      case 'plaineCommune':
      case 'estEnsemble':
      case 'montpellier':
      case 'bordeaux':
        return `Zone ${data['Zone']}`
    }
  }

  private geodataFile() {
    return JSON.parse(fs.readFileSync(path.join(CITY_FILE_PATHS[this.mainCity]), 'utf8'))
  }
}
