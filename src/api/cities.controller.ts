import { canHaveHouse } from '@services/filters/city-filter/can-have-house'
import { AvailableCities, getCityListObjectClone } from '@services/filters/city-filter/city-list'
import { dateBuiltRange } from '@services/filters/city-filter/date-build-range'
import { labelizeCity } from '@services/filters/city-filter/labelize-city'
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
      displayName: labelizeCity(city),
      displayNameMainCity: labelizeCity(mainCity),
    }

    return prev
  }, {})
  res.json(result)
}

module.exports = router
