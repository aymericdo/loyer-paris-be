import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { AvailableMainCities, CityService } from '@services/address/city'
import { EncadrementFilterFactory } from '@services/filters/encadrement-filter/encadrement-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import { roundNumber } from '@services/helpers/round-number'
import { Request, Response } from 'express'

export function getManualResult(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getManualResult`, 'blue')

  const city: AvailableMainCities = req.params.city as AvailableMainCities
  const districtValue: string = (req.query.districtValue as string) || null
  const priceValue = (req.query.priceValue as string) || null
  const furnishedValue = (req.query.furnishedValue as string) || null
  const surfaceValue: string = (req.query.surfaceValue as string) || null
  const roomValue: string = (req.query.roomValue as string) || null
  const isHouseValue: string = (req.query.isHouseValue as string) || null
  const dateBuiltValueStr: string = (req.query.dateBuiltValueStr as string) || null

  if (!city || !districtValue || !priceValue || !furnishedValue || !surfaceValue || !roomValue) {
    res.status(403)
    return
  }

  const district: string = districtValue
  const surface: number = +surfaceValue
  const price: number = +priceValue
  const room: number = +roomValue
  const dateBuiltStr: number = +dateBuiltValueStr
  const hasFurniture: boolean = furnishedValue === 'furnished' ? true : furnishedValue === 'nonFurnished' ? false : null

  const isHouse: boolean = +isHouseValue === 1

  const CurrentEncadrementFilter = new EncadrementFilterFactory(city).currentFilter()
  const params: InfoToFilter = {
    postalCode: null,
    coordinates: null,
    blurryCoordinates: null,
    yearBuilt: dateBuiltStr === -1 ? null : [dateBuiltStr],
    districtName: district,
    roomCount: room,
    hasFurniture,
  }

  if (CityService.canHaveHouse(city)) {
    params['isHouse'] = isHouse
  }

  const filteredResult: FilteredResult[] = new CurrentEncadrementFilter(params).filter()

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
