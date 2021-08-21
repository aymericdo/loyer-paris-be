import express, { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import { LilleFilterRentService } from '@services/filter-rent/lille-filter-rent'
import { ParisFilterRentService } from '@services/filter-rent/paris-filter-rent'
import { PlaineCommuneFilterRentService } from '@services/filter-rent/plaine-commune-filter-rent'
import { FilteredResult } from '@interfaces/ad'
import { roundNumber } from '@helpers/round-number'
const router = express.Router()

router.get('/:city', getManualResult)
function getManualResult(req: Request, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getManualResult`, 'blue')

  const city = req.params.city
  const districtValue: string = (req.query.districtValue as string) || null
  const priceValue = (req.query.priceValue as string) || null
  const furnishedValue = (req.query.furnishedValue as string) || null
  const surfaceValue: string = (req.query.surfaceValue as string) || null
  const roomValue: string = (req.query.roomValue as string) || null
  const isHouseValue: string = (req.query.isHouseValue as string) || null
  const dateBuiltValueStr: string =
    (req.query.dateBuiltValueStr as string) || null

  const district: string = districtValue
  const surface: number = +surfaceValue
  const price: number = +priceValue
  const room: number = +roomValue
  const dateBuiltStr: number = +dateBuiltValueStr
  const hasFurniture: boolean =
    furnishedValue === 'furnished'
      ? true
      : furnishedValue === 'nonFurnished'
      ? false
      : null

  const isHouse: boolean = +isHouseValue === 1

  let filteredResult: FilteredResult[] = []

  switch (city) {
    case 'paris':
      filteredResult = new ParisFilterRentService({
        yearBuilt: dateBuiltStr === -1 ? null : [dateBuiltStr],
        districtName: district,
        roomCount: room,
        hasFurniture,
      }).filter()
      break
    case 'lille':
      filteredResult = new LilleFilterRentService({
        yearBuilt: dateBuiltStr === -1 ? null : [dateBuiltStr],
        districtName: district,
        roomCount: room,
        hasFurniture,
      }).filter()
      break
    case 'plaine_commune':
      filteredResult = new PlaineCommuneFilterRentService({
        yearBuilt: dateBuiltStr === -1 ? null : [dateBuiltStr],
        districtName: district,
        isHouse,
        roomCount: room,
        hasFurniture,
      }).filter()
      break
  }

  res.json(
    filteredResult.map((r) => {
      delete r.minPrice

      return {
        ...r,
        maxTotalPrice: roundNumber(r.maxPrice * surface),
        isLegal: r.maxPrice * surface > price,
      }
    })
  )
}

module.exports = router
