import { string } from '@services/helpers/cleanup'
import { ERROR_CODE } from '@services/api/errors'
import Fuse from 'fuse.js'
import { AvailableCities } from '@services/city-config/classic-cities'
import { getCityList } from '@services/city-config/city-selectors'

export class CityFilter {
  cityText: string

  constructor(cityText: string) {
    this.cityText = cityText
  }

  findCity(): AvailableCities {
    const cityName = string(this.cityText)

    if (!cityName || !cityName?.length) {
      throw {
        error: ERROR_CODE.Address,
        msg: 'city not found',
        isIncompleteAd: true,
      }
    }

    let currentCity: AvailableCities = getCityList().find((city) =>
      cityName.includes(string(city)),
    )
    if (!currentCity) {
      const fuse = new Fuse(getCityList(), {
        minMatchCharLength: 4,
        includeScore: true,
      })
      const result = fuse.search(cityName)
      currentCity =
        result.length && result[0].score < 0.3
          ? (result[0].item as AvailableCities)
          : null
    }

    if (!currentCity) {
      const message = `city '${cityName}' not found in the list`

      throw {
        error: ERROR_CODE.BadLocation,
        msg: message,
      }
    }

    return currentCity
  }
}
