import { Ad, CleanAd, FilteredResult, IncompleteAd } from '@interfaces/ad'
import { Body } from '@interfaces/scrap-mapping'
import { getMainCity, isFake } from '@services/city-config/city-selectors'
import { ApiErrorsService, ERROR_CODE } from '@services/api/errors'
import { SerializerService } from '@services/api/serializer'
import { SaveRentService } from '@services/db/save-rent'
import { DigService } from '@services/diggers/dig'
import { FilterFactory } from '@services/filters/encadrement-filter/filter-factory'
import { getPriceExcludingCharges } from '@services/helpers/charges'
import { roundNumber } from '@services/helpers/round-number'
import { Response } from 'express'
import { CityFilter } from '@services/filters/city-filter'
import { ApiError } from '@interfaces/shared'
import { AvailableCities } from '@services/city-config/classic-cities'
import { AvailableMainCities } from '@services/city-config/main-cities'

export const DPE_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
export const PARTICULIER = 'Particulier'

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
  'foncia',
  'avendrealouer',
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

  async analyse(): Promise<void> {
    try {
      const data = await this.digData()
      this.res.json(data)
    } catch (error) {
      const apiError = new ApiErrorsService(error as ApiError)
      apiError.logger()
      apiError.saveIncompleteRent()
      const status = apiError.status
      if (status >= 500) {
        throw error
      } else {
        this.res.status(status).json(error)
      }
    }
  }

  abstract mapping(): Promise<Ad>

  async digData() {
    const ad: Ad = await this.mapping()
    const url = this.body.url && new URL(this.body.url)
    let city: AvailableCities | null = null

    try {
      city = new CityFilter(ad.cityLabel).findCity()
      const mainCity: AvailableMainCities = getMainCity(city)

      const cleanAd: CleanAd = await new DigService(ad).digInAd(city)

      if (cleanAd.colocation) {
        throw {
          error: ERROR_CODE.Colocation,
          msg: 'colocation found',
          isIncompleteAd: true,
        }
      }

      const encadrementFilterFactory = new FilterFactory(getMainCity(city))
      const currentEncadrementFilter =
        encadrementFilterFactory.currentEncadrementFilter(cleanAd)
      const filteredResult: FilteredResult =
        await currentEncadrementFilter.find()

      if (filteredResult) {
        const maxAuthorized = roundNumber(
          filteredResult.maxPrice * cleanAd.surface,
        )
        const priceExcludingCharges = getPriceExcludingCharges(
          cleanAd.price,
          cleanAd.charges,
          cleanAd.hasCharges,
        )
        const isLegal = priceExcludingCharges <= maxAuthorized

        await new SaveRentService({
          id: cleanAd.id,
          address: cleanAd.address,
          city: cleanAd.city,
          mainCity: mainCity,
          district: filteredResult.districtName,
          isFake: isFake(mainCity),
          dpe: cleanAd.dpe,
          rentComplement: cleanAd.rentComplement,
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
          filteredResult,
        ).serialize()
      } else {
        throw {
          error: ERROR_CODE.Filter,
          msg: 'no match found',
          isIncompleteAd: true,
        }
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
