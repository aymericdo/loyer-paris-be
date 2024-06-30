import { DistrictItem, GeojsonFile } from '@interfaces/shared'
import { AvailableCities, AvailableMainCities, CityService, cityList } from '@services/address/city'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { capitalizeFirstLetter } from '@services/helpers/capitalize'
import * as fs from 'fs'
import path from 'path'

interface DistrictElem {
  label: string
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

  async districtElemWithGroupBy(): Promise<DistrictElem[]> {
    return Object.keys(cityList)
      .filter((city) => {
        if (this.city) {
          return this.city === city
        } else {
          return cityList[city].mainCity === this.mainCity
        }
      })
      .reduce((prev, city) => {
        const currentZones = cityList[city].zones
        if (Array.isArray(currentZones)) {
          (currentZones as string[]).forEach((zone) => {
            const labelZone = capitalizeFirstLetter(`${city} (zone ${zone})`)

            prev.push({
              value: zone,
              label: labelZone,
              displaySequence: labelZone,
              groupBy: null,
            })
          })
        } else {
          Object.keys(currentZones).forEach((arrondissement: string) => {
            currentZones[arrondissement].forEach((zone: string) => {
              prev.push({
                value: zone,
                label: zone,
                displaySequence: arrondissement,
                groupBy: `${arrondissement}${(+arrondissement > 1
                  ? 'ème'
                  : 'er'
                ).toString()} arrondissement`,
              })
            })
          })
        }

        return prev
      }, [])
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
