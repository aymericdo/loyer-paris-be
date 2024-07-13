import { canHaveHouse } from '@services/filters/city-filter/can-have-house'
import { AvailableCities, getCityListObjectClone } from '@services/filters/city-filter/city-list'
import { coordinates } from '@services/filters/city-filter/coordinates'
import { dateBuiltRange } from '@services/filters/city-filter/date-build-range'
import { label } from '@services/filters/city-filter/label'
import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/list', getValidCityList)
function getValidCityList(req: Request, res: Response) {
  const copyCityList = getCityListObjectClone()
  const result = Object.keys(copyCityList).reduce((prev, city: AvailableCities) => {
    const mainCity = copyCityList[city].mainCity

    prev[city] = {
      ...copyCityList[city],
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
