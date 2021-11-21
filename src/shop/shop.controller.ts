import express, { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as rentService from '@db/rent.service'
const router = express.Router()

router.get('/', getRelevantAds)
function getRelevantAds(req: Request, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getRelevantAds`, 'blue')
  const page: number = +req.query.page
  const perPage: number = +req.query.perPage

  const city: string = (req.query.cityValue as string) || null
  const districtValues: string = (req.query.districtValues as string) || null
  const priceValue = (req.query.priceValue as string) || null
  const furnishedValue = (req.query.furnishedValue as string) || null
  const surfaceValue: string = (req.query.surfaceValue as string) || null
  const roomValue: string = (req.query.roomValue as string) || null
  const isHouseValue: string = (req.query.isHouseValue as string) || null
  const isLegalValue: string = (req.query.isLegal as string) || null

  const districtList: string[] = districtValues
    ?.split(',')
    ?.map((v) => v)
    .filter(Boolean)
  const surfaceRange: number[] = surfaceValue?.split(',')?.map((v) => +v)
  const priceRange: number[] = priceValue?.split(',')?.map((v) => +v)
  const roomRange: number[] = roomValue?.split(',')?.map((v) => +v)
  const hasFurniture: boolean =
    furnishedValue === 'furnished'
      ? true
      : furnishedValue === 'nonFurnished'
      ? false
      : null
  const isLegal: boolean =
    isLegalValue != 'null' ? isLegalValue === 'true' : false
  const isHouse: boolean = isHouseValue != 'null' ? +isHouseValue === 1 : null

  const filter = {
    city,
    districtList,
    surfaceRange,
    priceRange,
    roomRange,
    hasFurniture,
    isHouse,
    isLegal,
  }

  Promise.all([
    rentService.getRelevantAdsData(filter, { page, perPage }),
    rentService.getRelevantAdsDataTotalCount(filter),
  ])
    .then(([data, total]) => {
      res.set({
        'X-Total-Count': total.toString(),
        'Access-Control-Expose-Headers': 'X-Total-Count',
      })
      res.json(data)
    })
    .catch((err) => {
      console.log(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        log.error('Error 500')
        res.status(500).json(err)
      }
    })
}

module.exports = router
