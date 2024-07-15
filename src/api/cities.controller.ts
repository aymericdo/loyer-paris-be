import { canHaveHouse } from '@services/filters/city-filter/can-have-house'
import { AvailableCities, getCityList, getMainCity } from '@services/filters/city-filter/city-list'
import { coordinates } from '@services/filters/city-filter/coordinates'
import { dateBuiltRange } from '@services/filters/city-filter/date-build-range'
import { isFake } from '@services/filters/city-filter/fake'
import { label } from '@services/filters/city-filter/label'
import { zones } from '@services/filters/city-filter/zones'
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
