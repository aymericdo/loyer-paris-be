import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { queryParamValidator } from '@services/api/validations'
import { AvailableMainCities, getCitiesFromMainCity } from '@services/filters/city-filter/city-list'
import { infoLink } from '@services/filters/city-filter/info-link'
import { zones } from '@services/filters/city-filter/zones'
import { EncadrementFilterFactory } from '@services/filters/encadrement-filter/encadrement-filter-factory'
import { PrettyLog } from '@services/helpers/pretty-log'
import { roundNumber } from '@services/helpers/round-number'
import { YearBuiltService } from '@services/helpers/year-built'
import { Request, Response } from 'express'

export async function getManualResult(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getManualResult`, 'blue')

  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities

  const districtValue: string = queryParamValidator(req.query.districtValue as string)
  const priceValue = queryParamValidator(req.query.priceValue as string)
  const furnishedValue = queryParamValidator(req.query.furnishedValue as string)
  const surfaceValue: string = queryParamValidator(req.query.surfaceValue as string)
  const roomValue: string = queryParamValidator(req.query.roomValue as string)
  const isHouseValue: string = queryParamValidator(req.query.isHouseValue as string)
  const dateBuiltValueStr: string = queryParamValidator(req.query.dateBuiltValueStr as string)

  if (!mainCity || !districtValue || !priceValue || !furnishedValue || !surfaceValue || !roomValue) {
    res.status(403).send('missing params')
    return
  }

  const district: string = districtValue
  const surface: number = +surfaceValue
  const price: number = +priceValue
  const room: number = +roomValue
  const dateBuiltRange: [number, number] = YearBuiltService.formatAsYearBuilt(dateBuiltValueStr)
  const hasFurniture: boolean = furnishedValue === 'furnished' ? true : furnishedValue === 'nonFurnished' ? false : null
  const isHouse: boolean = isHouseValue !== null ? +isHouseValue === 1 : false

  if (!getCitiesFromMainCity(mainCity).some((city) => {
    const cityZones = zones(city)
    return  (Array.isArray(cityZones)) ?
      cityZones.includes(district) :
      Object.values(cityZones).flat().includes(district)
  })) {
    res.status(403).send('zone is not corresponding')
    return
  }

  const CurrentEncadrementFilter = new EncadrementFilterFactory(mainCity).currentEncadrementFilter()
  const params: InfoToFilter = {
    city: null,
    postalCode: null,
    coordinates: null,
    blurryCoordinates: null,
    yearBuilt: dateBuiltRange[0] === -1 ? null : dateBuiltRange,
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
        moreInfo: infoLink(mainCity),
      }
    })
  )
}
