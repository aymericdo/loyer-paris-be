import { Ad, CleanAd, FilteredResult, IncompleteAd } from '@interfaces/ad'
import { Body } from '@interfaces/mapping'
import { ApiError } from '@interfaces/shared'
import { AvailableCities, CityService, cityList } from '@services/address/city'
import { ApiErrorsService, ERROR_CODE } from '@services/api/errors'
import { SerializerService } from '@services/api/serializer'
import { SaveRentService } from '@services/db/save-rent'
import { DigService } from '@services/diggers/dig'
import { EncadrementFilterFactory } from '@services/filters/encadrement-filter/encadrement-filter-factory'
import { getPriceExcludingCharges } from '@services/helpers/charges'
import { roundNumber } from '@services/helpers/round-number'
import { Response } from 'express'

export const DPE_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
export const PARTICULIER_WORD = 'Particulier'

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
export type WebsiteType = (typeof WEBSITE_LIST)[number]

export abstract class Website {
  website: WebsiteType = null
  body: Body = null
  res: Response = null

  constructor(res: Response, props: { body: Body; id?: string }) {
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

  abstract mapping(): Promise<Ad>

  async digData() {
    const ad: Ad = await this.mapping()
    const url = this.body.url && new URL(this.body.url)

    const cityService = new CityService(ad)
    const city: AvailableCities = cityService.findCity()

    try {
      const cleanAd: CleanAd = await new DigService(ad).digInAd(city)

      const CurrentEncadrementFilter = new EncadrementFilterFactory(cityList[city].mainCity).currentEncadrementFilter()
      const filteredResult: FilteredResult = await new CurrentEncadrementFilter(cleanAd).find()

      if (filteredResult) {
        const maxAuthorized = roundNumber(filteredResult.maxPrice * cleanAd.surface)
        const priceExcludingCharges = getPriceExcludingCharges(cleanAd.price, cleanAd.charges, cleanAd.hasCharges)
        const isLegal = priceExcludingCharges <= maxAuthorized

        await new SaveRentService({
          id: cleanAd.id,
          address: cleanAd.address,
          city: cleanAd.city,
          district: filteredResult.districtName,
          dpe: cleanAd.dpe,
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
