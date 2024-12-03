import { AvailableMainCities, mainCityList } from '@services/filters/city-filter/city-list'
import { isFake } from '@services/filters/city-filter/fake'
import { Response } from 'express'

export const isMainCityValid = (res: Response, mainCity: AvailableMainCities | 'all', allAccepted = false) => {
  if (allAccepted && mainCity === 'all') return

  if (!mainCityList.includes(mainCity as AvailableMainCities) || isFake(mainCity as AvailableMainCities)) {
    res.status(403).json({ message: 'City params not valid' })
  }
}