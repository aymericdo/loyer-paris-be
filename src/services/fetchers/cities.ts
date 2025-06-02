import { AvailableCities } from '@services/filters/city-filter/city-list'
import { inseeCode } from '@services/filters/city-filter/code-insee'
import { label } from '@services/filters/city-filter/label'
import { PrettyLog } from '@services/helpers/pretty-log'
import axios from 'axios'

export class CitiesFetcher {
  cities: AvailableCities[] = null

  constructor(cities: AvailableCities[]) {
    this.cities = cities
  }

  async fetchGeojson() {
    const cityByInseeCodes = this.cityByInseeCodes()

    const geojsonPromises = Object.keys(cityByInseeCodes).map(async (inseeCode) => {
      try {
        return await axios(`https://geo.api.gouv.fr/communes/${inseeCode}?fields=code,nom,contour`)
      } catch (error) {
        PrettyLog.call(error.message, 'red')
      }
    })

    const results = await Promise.all(geojsonPromises)

    return {
      type: 'FeatureCollection',
      features: results.filter(Boolean).map((result) => ({
        type: 'Feature',
        geometry: {
          ...result.data.contour,
        },
        properties: {
          city: label(cityByInseeCodes[result.data.code] as AvailableCities),
        },
      })),
    }
  }

  private cityByInseeCodes() {
    return this.cities.reduce((prev, city) => {
      prev[inseeCode(city)] = city
      return prev
    }, {})
  }
}
