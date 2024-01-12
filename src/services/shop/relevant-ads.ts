import { getRelevantAdsData, getRelevantAdsDataTotalCount } from '@db/rent.service'
import { ERROR500_MSG } from '@services/api/errors'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'

export async function getRelevantAds(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getRelevantAds`, 'blue')
  const page: number = +req.query.page
  const perPage: number = +req.query.perPage

  const city: string = (req.query.cityValue as string) || null
  const districtValues: string = (req.query.districtValues as string) || null
  const priceValue = (req.query.priceValue as string) || null
  const exceedingValue = (req.query.exceedingValue as string) || null
  const furnishedValue = (req.query.furnishedValue as string) || null
  const surfaceValue: string = (req.query.surfaceValue as string) || null
  const roomValue: string = (req.query.roomValue as string) || null
  const isHouseValue: string = (req.query.isHouseValue as string) || null
  const isLegalValue: string = (req.query.isLegal as string) || null

  const districtList: string[] = districtValues
    ? districtValues
      .split(',')
      ?.map((v) => v)
      .filter(Boolean)
    : []
  const surfaceRange: number[] = surfaceValue?.split(',')?.map((v) => +v)
  const priceRange: number[] = priceValue?.split(',')?.map((v) => +v)
  const exceedingRange: number[] = exceedingValue?.split(',')?.map((v) => +v)
  const roomRange: number[] = roomValue && roomValue !== '1,6' && roomValue?.split(',')?.map((v) => +v)
  const hasFurniture: boolean = furnishedValue === 'furnished' ? true : furnishedValue === 'nonFurnished' ? false : null

  if (!isLegalValue || !['true', 'false'].includes(isLegalValue)) {
    res.status(403).json('isLegal need to be passed as query parameter')
    return
  }

  const isLegal: boolean = isLegalValue === 'true'
  const isHouse: boolean = isHouseValue && isHouseValue != 'null' ? +isHouseValue === 1 : null

  const filter = {
    city,
    districtList,
    surfaceRange,
    priceRange,
    exceedingRange,
    roomRange,
    hasFurniture,
    isHouse,
    isLegal,
  }

  Promise.all([getRelevantAdsData(filter, { page, perPage }), getRelevantAdsDataTotalCount(filter)])
    .then(([data, total]) => {
      res.set({
        'X-Total-Count': total.toString(),
        'Access-Control-Expose-Headers': 'X-Total-Count',
      })
      res.json(data)
    })
    .catch((err) => {
      console.error(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        PrettyLog.call(ERROR500_MSG, 'red')
        res.status(500).json(err)
      }
    })
}
