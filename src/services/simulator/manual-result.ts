import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { getInfoLink } from '@services/filters/city-filter/more-information'
import { EncadrementFilterFactory } from '@services/filters/encadrement-filter/encadrement-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import { roundNumber } from '@services/helpers/round-number'
import { YearBuiltService } from '@services/helpers/year-built'
import { Request, Response } from 'express'

export async function getManualResult(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getManualResult`, 'blue')

  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  const districtValue: string = (req.query.districtValue as string) || null
  const priceValue = (req.query.priceValue as string) || null
  const furnishedValue = (req.query.furnishedValue as string) || null
  const surfaceValue: string = (req.query.surfaceValue as string) || null
  const roomValue: string = (req.query.roomValue as string) || null
  const isHouseValue: string = (req.query.isHouseValue as string) || null
  const dateBuiltValueStr: string = (req.query.dateBuiltValueStr as string) || null

  if (!mainCity || !districtValue || !priceValue || !furnishedValue || !surfaceValue || !roomValue) {
    res.status(403).send('missing params')
    return
  }

  const district: string = districtValue
  const surface: number = +surfaceValue
  const price: number = +priceValue
  const room: number = +roomValue
  const dateBuiltStr: number[] = YearBuiltService.formatAsYearBuilt(dateBuiltValueStr)
  const hasFurniture: boolean = furnishedValue === 'furnished' ? true : furnishedValue === 'nonFurnished' ? false : null
  const isHouse: boolean = isHouseValue !== null ? +isHouseValue === 1 : false

  const CurrentEncadrementFilter = new EncadrementFilterFactory(mainCity).currentEncadrementFilter()
  const params: InfoToFilter = {
    city: null,
    postalCode: null,
    coordinates: null,
    blurryCoordinates: null,
    yearBuilt: dateBuiltStr[0] === -1 ? null : dateBuiltStr,
    districtName: district,
    roomCount: room,
    hasFurniture,
    isHouse,
  }

  const currentEncadrementFilter = new CurrentEncadrementFilter(params)
  const filteredResult: FilteredResult[] = await currentEncadrementFilter.filter()

  res.json(
    filteredResult.map((r) => {
      delete r.minPrice

      return {
        ...r,
        maxTotalPrice: roundNumber(r.maxPrice * surface),
        isLegal: r.maxPrice * surface > price,
        yearBuilt: YearBuiltService.getDisplayableYearBuilt(
          currentEncadrementFilter.rangeTimeToUniversalRangeTime(r.yearBuilt)
        ),
        moreInfo: getInfoLink(mainCity),
      }
    })
  )
}
