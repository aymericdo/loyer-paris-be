import { AvailableCities } from '@services/city-config/cities'
import { AvailableCityZones } from '@services/city-config/city-selectors'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { getRelevantAdsData, getRelevantAdsDataTotalCount } from '@services/db/queries/get-relevants-ad'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'

export async function getRelevantAds(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getRelevantAds`, 'blue')
  const page: number = +req.query.page
  const perPage: number = +req.query.perPage

  const mainCity: AvailableMainCities | 'all' = (req.query.cityValue as AvailableMainCities | 'all') || null
  const city: AvailableCities | 'all' = (req.query.cityValue2 as AvailableCities | 'all') || null
  const districtValues: string = (req.query.districtValues as string) || null
  const priceValue = (req.query.priceValue as string) || null
  const exceedingValue = (req.query.exceedingValue as string) || null
  const furnishedValue = (req.query.furnishedValue as string) || null
  const surfaceValue: string = (req.query.surfaceValue as string) || null
  const roomValue: string = (req.query.roomValue as string) || null
  const isHouseValue: string = (req.query.isHouseValue as string) || null
  const isLegalValue: string = (req.query.isLegal as string) || null

  const districtList = (districtValues
    ? districtValues
      .split(',')
      ?.map((v) => v)
      .filter(Boolean)
    : []) as unknown as AvailableCityZones
  const surfaceRange: [number, number] = surfaceValue?.split(',')?.map((v) => +v).splice(0, 2) as [number, number]
  const priceRange: [number, number] = priceValue?.split(',')?.map((v) => +v).splice(0, 2) as [number, number]
  const exceedingRange: [number, number] = exceedingValue?.split(',')?.map((v) => +v).splice(0, 2) as [number, number]
  const roomRange: [number, number] = roomValue?.split(',')?.map((v) => +v).splice(0, 2) as [number, number]
  const hasFurniture: boolean = furnishedValue === 'furnished' ? true : furnishedValue === 'nonFurnished' ? false : null

  if (!isLegalValue || !['true', 'false'].includes(isLegalValue)) {
    res.status(403).json('isLegal need to be passed as query parameter')
    return
  }

  const isLegal: boolean = isLegalValue === 'true'
  const isHouse: boolean = isHouseValue && isHouseValue != 'null' ? +isHouseValue === 1 : null

  const filter = {
    mainCity,
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

  const [data, total] = await Promise.all([getRelevantAdsData(filter, { page, perPage }), getRelevantAdsDataTotalCount(filter)])
  res.set({
    'X-Total-Count': total.toString(),
    'Access-Control-Expose-Headers': 'X-Total-Count',
  })
  res.json(data)
}
