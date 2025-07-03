import { getMainCityList, isFake } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { Request, Response, NextFunction } from 'express'

const isMainCityValid = (
  mainCity: AvailableMainCities | 'all',
  allAccepted: boolean,
  fakeAccepted: boolean,
) => {
  if (allAccepted && mainCity === 'all') return true

  if (
    !getMainCityList().includes(mainCity as AvailableMainCities) ||
    (!fakeAccepted && isFake(mainCity as AvailableMainCities))
  ) {
    return false
  }

  return true
}

export function paramMiddleware(
  params: { allAccepted?: boolean; fakeAccepted?: boolean } = {},
) {
  params = {
    allAccepted: false,
    fakeAccepted: false,
    ...params,
  }
  return function (req: Request, res: Response, next: NextFunction) {
    if (
      isMainCityValid(
        req.params.city as AvailableMainCities,
        params.allAccepted,
        params.fakeAccepted,
      )
    ) {
      next()
    } else {
      res.status(403).json({ message: 'City params not valid' })
    }
  }
}

export function queryParamValidator(value: string): string | null {
  return value && value !== 'null' && value !== 'undefined' ? value : null
}
