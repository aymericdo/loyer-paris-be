import { getPriceExcludingCharges } from '@helpers/charges'
import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { Ad, CleanAd, FilteredResult } from '@interfaces/ad'
import { Mapping } from '@interfaces/mapping'
import { ApiError } from '@interfaces/shared'
import { ApiErrorsService, ErrorCode } from '@services/api-errors'
import { DigService } from '@services/dig'
import { LilleFilterRentService } from '@services/filter-rent/lille-filter-rent'
import { ParisFilterRentService } from '@services/filter-rent/paris-filter-rent'
import { SaveRentService } from '@services/save-rent'
import { SerializeRentService } from '@services/serialize-rent'
import { Response } from 'express'

export abstract class Website {
  website: string = null
  body: Mapping = null
  isV2: boolean = null
  res: Response = null

  constructor(
    res: Response,
    props: { body: Mapping; id?: string },
    v2: boolean = false
  ) {
    this.res = res
    this.body = props.body
    this.isV2 = v2
  }

  analyse(): void {
    this.digData()
      .then((data) => {
        this.res.json(data)
      })
      .catch((err: ApiError) => {
        if (err.error) {
          const status = ApiErrorsService.getStatus(err)
          this.res.status(status).json(err)
        } else {
          console.log(err)
          log.error('ERROR 500')
          this.res.status(500).json(err)
        }
      })
  }

  abstract mapping(): Promise<Ad>

  async digData() {
    const ad: Ad = await this.mapping()

    if (!ad.price) {
      log.info(`no price found with scrapping`, 'red')
    } else if (!ad.surface) {
      log.info(`no surface found with scrapping`, 'red')
    } else if (!ad.rooms) {
      log.info(`no rooms found with scrapping`, 'red')
    }

    const cleanAd: CleanAd = await new DigService(ad).digInAd()
    let filteredResult: FilteredResult = null
    switch (cleanAd.city) {
      case 'paris':
        filteredResult = new ParisFilterRentService(cleanAd).filter()
        break
      case 'lille':
      case 'hellemmes':
      case 'lomme':
        filteredResult = new LilleFilterRentService(cleanAd).filter()
        break
    }

    if (filteredResult) {
      const maxAuthorized = roundNumber(
        filteredResult.maxPrice * cleanAd.surface
      )
      const priceExcludingCharges = getPriceExcludingCharges(
        cleanAd.price,
        cleanAd.charges,
        cleanAd.hasCharges
      )
      const isLegal = priceExcludingCharges <= maxAuthorized

      await new SaveRentService({
        id: cleanAd.id,
        address: cleanAd.address,
        city: cleanAd.city,
        district: filteredResult.districtName,
        hasFurniture: cleanAd.hasFurniture,
        postalCode: cleanAd.postalCode,
        price: cleanAd.price,
        renter: cleanAd.renter,
        roomCount: cleanAd.roomCount,
        stations: cleanAd.stations,
        surface: cleanAd.surface,
        yearBuilt: cleanAd.yearBuilt,
        isLegal,
        latitude: cleanAd.coordinates?.lat,
        longitude: cleanAd.coordinates?.lng,
        maxPrice: maxAuthorized,
        priceExcludingCharges,
        website: this.website,
        url: this.body.url,
      }).save()

      return new SerializeRentService(
        {
          ...cleanAd,
          isLegal,
          maxAuthorized,
          priceExcludingCharges,
        },
        filteredResult
      ).serialize()
    } else {
      throw { error: ErrorCode.Filter, msg: 'no match found' }
    }
  }
}
