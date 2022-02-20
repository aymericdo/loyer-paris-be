import { getPriceExcludingCharges } from '@helpers/charges'
import { roundNumber } from '@helpers/round-number'
import { Ad, CleanAd, FilteredResult, IncompleteAd } from '@interfaces/ad'
import { Mapping } from '@interfaces/mapping'
import { ApiError } from '@interfaces/shared'
import { ApiErrorsService, ERROR_CODE } from '@services/api-errors'
import { DigService } from '@services/dig'
import { LilleFilterRentService } from '@services/filter-rent/lille-filter-rent'
import { LyonFilterRentService } from '@services/filter-rent/lyon-filter-rent'
import { ParisFilterRentService } from '@services/filter-rent/paris-filter-rent'
import { PlaineCommuneFilterRentService } from '@services/filter-rent/plaine-commune-filter-rent'
import { SaveRentService } from '@services/save-rent'
import { SerializeRentService } from '@services/serialize-rent'
import { Response } from 'express'
import { AvailableCities, cityList, CityService } from '@services/address/city'

export const PARTICULIER_TERM = 'Particulier'

export const WEBSITE_LIST = [
  'bellesdemeures',
  'bienici',
  'facebook',
  'fnaim',
  'gensdeconfiance',
  'leboncoin',
  'lefigaro',
  'locservice',
  'logicimmo',
  'loueragile',
  'luxresidence',
  'orpi',
  'pap',
  'seloger',
  'superimmo'
] as const

export const FUNNIEST_WEBSITES = ['bellesdemeures', 'luxresidence']
export type WebsiteType = typeof WEBSITE_LIST[number];

export abstract class Website {
  website: WebsiteType = null
  body: Mapping = null
  isV2: boolean = null
  res: Response = null

  constructor(
    res: Response,
    props: { body: Mapping; id?: string },
    v2 = false
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
        const status = new ApiErrorsService(err).getStatus()
        this.res.status(status).json(err)
      })
  }

  abstract mapping(): Promise<Ad>

  async digData() {
    const ad: Ad = await this.mapping()
    const url = this.body.url && new URL(this.body.url)

    const cityService = new CityService(ad)
    const city: AvailableCities = cityService.findCity()

    try {
      const cleanAd: CleanAd = await new DigService(ad).digInAd(city)

      let filteredResult: FilteredResult = null
      switch (cityList[cleanAd.city].mainCity) {
        case 'paris':
          filteredResult = new ParisFilterRentService(cleanAd).find()
          break
        case 'lille':
          filteredResult = new LilleFilterRentService(cleanAd).find()
          break
        case 'plaineCommune':
          filteredResult = new PlaineCommuneFilterRentService(cleanAd).find()
          break
        case 'lyon':
          filteredResult = new LyonFilterRentService(cleanAd).find()
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
          isHouse: cleanAd.isHouse,
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
          url: url && `${url.origin}${url.pathname}`,
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
        throw { error: ERROR_CODE.Filter, msg: 'no match found' }
      }
    } catch (err) {
      const incompleteAd: IncompleteAd = {
        id: ad.id,
        website: this.website,
        url: url && `${url.origin}${url.pathname}`,
        city,
      }

      throw { ...err, incompleteAd }
    }
  }
}
