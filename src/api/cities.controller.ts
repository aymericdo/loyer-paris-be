import { cityList } from '@services/filters/city-filter/valid-cities-list'
import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/', getValidCityList)
function getValidCityList(req: Request, res: Response) {
  res.json(Object.keys(cityList).reduce((prev, city) => {
    const cityData = { ...cityList[city] }
    delete cityData.postalCodePossibilities
    delete cityData.postalCodeRegex
    prev[city] = cityData
    return prev
  }, {}))
}

module.exports = router
