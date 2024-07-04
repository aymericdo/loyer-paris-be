import { getCityListObjectClone } from '@services/filters/city-filter/city-list'
import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/', getValidCityList)
function getValidCityList(req: Request, res: Response) {
  const copyCityList = getCityListObjectClone()
  res.json(copyCityList)
}

module.exports = router
