import { AvailableCities } from '@services/city-config/classic-cities'
import {
  canHaveHouse,
  coordinates,
  dateBuiltRange,
  getCityList,
  getMainCity,
  isFake,
  label,
  zones,
} from '@services/city-config/city-selectors'
import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/list', getValidCityList)
function getValidCityList(req: Request, res: Response) {
  const includeFake = req.query.includeFake === 'true'

  const result = getCityList().reduce((prev, city: AvailableCities) => {
    const mainCity = getMainCity(city)
    if (!includeFake && isFake(mainCity)) return prev

    prev[city] = {
      mainCity,
      zones: zones(city),
      dateBuiltRange: dateBuiltRange(mainCity),
      hasHouse: canHaveHouse(mainCity),
      coordinates: coordinates(mainCity),
      displayName: {
        city: label(city),
        mainCity: label(mainCity),
      },
    }

    return prev
  }, {})
  res.json(result)
}

export default router
