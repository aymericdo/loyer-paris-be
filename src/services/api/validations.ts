import { AvailableMainCities, mainCityList } from '@services/filters/city-filter/city-list'
import { isFake } from '@services/filters/city-filter/fake'
import { Request, Response, NextFunction } from 'express'

const isMainCityValid = (mainCity: AvailableMainCities | 'all', allAccepted = false) => {
  if (allAccepted && mainCity === 'all') return true

  if (!mainCityList.includes(mainCity as AvailableMainCities) || isFake(mainCity as AvailableMainCities)) {
    return false
  }

  return true
}

export function paramMiddleware(allAccepted = false) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (isMainCityValid(req.params.city as AvailableMainCities, allAccepted)) {
      next()
    } else {
      res.status(403).json({ message: 'City params not valid' })
    }
  }
}

export function queryParamValidator(value: string): string | null {
  return (value && value !== 'null' && value !== 'undefined') ? value : null
}
