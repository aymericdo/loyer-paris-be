import { canHaveHouse } from '@services/city-config/can-have-house'
import { AvailableCities, getCityList, getMainCity } from '@services/city-config/list'
import { coordinates } from '@services/city-config/coordinates'
import { dateBuiltRange } from '@services/city-config/date-build-range'
import { isFake } from '@services/city-config/fake'
import { label } from '@services/city-config/label'
import { zones } from '@services/city-config/zones'
import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/list', getValidCityList)
function getValidCityList(req: Request, res: Response) {
  const result = getCityList().reduce((prev, city: AvailableCities) => {
    const mainCity = getMainCity(city)
    if (isFake(mainCity)) return prev

    prev[city] = {
      mainCity,
      zones: zones(city),
      dateBuiltRange: dateBuiltRange(mainCity),
      hasHouse: canHaveHouse(mainCity),
      coordinates: coordinates(mainCity),
      displayName: {
        city: label(city),
        mainCity: label(mainCity),
      }
    }

    return prev
  }, {})
  res.json(result)
}

module.exports = router
