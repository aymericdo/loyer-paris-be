import { getPriceExcludingCharges } from '@services/helpers/charges'
import { roundNumber } from '@services/helpers/round-number'
import { Ad, CleanAd, FilteredResult, IncompleteAd } from '@interfaces/ad'
import { Mapping } from '@interfaces/mapping'
import { ApiError } from '@interfaces/shared'
import { ApiErrorsService, ERROR_CODE } from '@services/api/errors'
import { DigService } from '@services/diggers/dig'
import { SerializerService } from '@services/api/serializer'
import { Response } from 'express'
import { AvailableCities, cityList, CityService } from '@services/address/city'
import { SaveRentService } from '@services/db/save-rent'
import { EncadrementFilterFactory } from '@services/filters/encadrement-filter/encadrement-filter-factory'

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
  'luxresidence',
  'orpi',
  'pap',
  'seloger',
  'superimmo',
] as const

export const FUNNIEST_WEBSITES = ['bellesdemeures', 'luxresidence']
export type WebsiteType = typeof WEBSITE_LIST[number]

export abstract class Website {
  website: WebsiteType = null
  body: Mapping = null
  res: Response = null

  constructor(
    res: Response,
    props: { body: Mapping; id?: string },
  ) {
    this.res = res
    this.body = props.body
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

  abstract mapping(): Promise<Ad>;

  async digData() {
    const ad: Ad = await this.mapping()
    const url = this.body.url && new URL(this.body.url)

    const cityService = new CityService(ad)
    const city: AvailableCities = cityService.findCity()

    try {
      const cleanAd: CleanAd = await new DigService(ad).digInAd(city)

      const CurrentEncadrementFilter = new EncadrementFilterFactory(cityList[city].mainCity).currentFilter()
      const filteredResult: FilteredResult = new CurrentEncadrementFilter(cleanAd).find()

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

        return new SerializerService(
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
      console.error(err)
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
