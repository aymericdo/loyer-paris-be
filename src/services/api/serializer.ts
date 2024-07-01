import { FilteredResult } from '@interfaces/ad'
import { AvailableCities, cityList } from '@services/address/city'
import { MORE_INFO } from '@services/helpers/more-information'
import { PrettyLog } from '@services/helpers/pretty-log'
import { roundNumber } from '@services/helpers/round-number'
import { YearBuiltService } from '@services/helpers/year-built'

interface SerializedInfo {
  address: string
  charges?: number
  hasCharges?: boolean
  city: AvailableCities
  hasFurniture?: boolean
  isHouse?: boolean
  isLegal: boolean
  maxAuthorized: number
  postalCode: string
  price: number
  priceExcludingCharges: number
  roomCount?: number
  surface: number
  yearBuilt?: number[]
}

export class SerializerService {
  serializedInfo: SerializedInfo = null
  filteredResult: FilteredResult = null

  constructor(serializedInfo: SerializedInfo, filteredResult: FilteredResult) {
    this.serializedInfo = serializedInfo
    this.filteredResult = filteredResult
  }

  serialize() {
    PrettyLog.call('serializing answer', 'green')

    const {
      address,
      charges,
      city,
      hasCharges,
      hasFurniture,
      isHouse,
      isLegal,
      maxAuthorized,
      postalCode,
      price,
      priceExcludingCharges,
      roomCount,
      surface,
      yearBuilt,
    } = this.serializedInfo

    const cityCapitalize = (city as string).charAt(0).toUpperCase() + (city as string).slice(1)

    return {
      detectedInfo: {
        address: {
          order: 0,
          value: `${address || ''}${postalCode ? (address ? ' ' + postalCode : postalCode) : ''}${
            address || postalCode ? ', ' : ''
          }${cityCapitalize}`,
        },
        hasFurniture: { order: 1, value: hasFurniture },
        roomCount: { order: 2, value: roomCount },
        surface: { order: 3, value: surface },
        yearBuilt: {
          order: 4,
          value: YearBuiltService.getDisplayableYearBuilt(yearBuilt),
        },
        isHouse: { order: 5, value: isHouse ? 'Maison' : null },
        price: { order: 6, value: roundNumber(price) },
        charges: { order: 7, value: roundNumber(charges) },
        hasCharges: {
          order: 8,
          value: !charges && hasCharges != null ? hasCharges : null,
        },
      },
      computedInfo: {
        neighborhood: { order: 0, value: this.filteredResult.districtName },
        hasFurniture: { order: 1, value: this.filteredResult.isFurnished },
        roomCount: { order: 2, value: this.filteredResult.roomCount },
        surface: { order: 3, value: surface },
        dateRange: { order: 4, value: YearBuiltService.formatAfterBeforeWord(this.filteredResult.yearBuilt) },
        isHouse: { order: 5, value: this.filteredResult.isHouse },
        max: {
          order: 6,
          value: !isLegal ? roundNumber(this.filteredResult.maxPrice) : null,
        },
        maxAuthorized: { order: 7, value: !isLegal ? maxAuthorized : null },
        promoPercentage: {
          order: 8,
          value: !isLegal ? roundNumber(100 - (maxAuthorized * 100) / priceExcludingCharges) : null,
        },
      },
      isLegal,
      moreInfo: MORE_INFO[cityList[city].mainCity],
    }
  }
}
