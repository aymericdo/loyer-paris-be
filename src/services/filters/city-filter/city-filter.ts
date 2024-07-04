import { string } from '@services/helpers/cleanup'
import { ERROR_CODE } from '@services/api/errors'
import { AvailableCities } from '@services/filters/city-filter/city-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Slack } from '@messenger/slack'
import { getCityList } from '@services/filters/city-filter/city-list'

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

    const cityInList: AvailableCities = getCityList().find((city) => cityName.includes(city)) as AvailableCities

    if (!cityInList) {
      const message = `city '${cityName}' not found in the list`
      PrettyLog.call(message, 'yellow')
      new Slack().sendMessage('#bad-location', message)

      throw {
        error: ERROR_CODE.City,
        msg: 'city not found in the list',
      }
    }

    return cityInList
  }
}
