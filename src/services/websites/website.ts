import { Ad, FilteredResult, IncompleteAd } from '@interfaces/ad'
import { Body } from '@interfaces/scrap-mapping'
import { ApiError } from '@interfaces/shared'
import { ApiErrorsService } from '@services/api/errors'
import { extrcatAdData } from '@services/diggers/aiDigger'
import { AvailableCities, getMainCity } from '@services/filters/city-filter/city-list'
import { EncadrementFilterFactory } from '@services/filters/encadrement-filter/encadrement-filter-factory'
import { Response } from 'express'

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
    const city: AvailableCities | null = null

    try {
      const cleanAd = await extrcatAdData(this.body.data)
      console.log(cleanAd)
      // const cityService = new CityFilter(ad.cityLabel)
      // city = cityService.findCity()
      // const mainCity: AvailableMainCities = getMainCity(city)

      // const cleanAd: CleanAd = await new DigService(ad).digInAd(city)

      const CurrentEncadrementFilter = new EncadrementFilterFactory(getMainCity(city)).currentEncadrementFilter()
      // @ts-expect-error
      const filteredResult: FilteredResult = await new CurrentEncadrementFilter(cleanAd).find()
      console.log(filteredResult)

      // if (filteredResult) {
      //   const maxAuthorized = roundNumber(filteredResult.maxPrice * cleanAd.surface)
      //   const priceExcludingCharges = getPriceExcludingCharges(cleanAd.price, cleanAd.charges, cleanAd.hasCharges)
      //   const isLegal = priceExcludingCharges <= maxAuthorized

      //   await new SaveRentService({
      //     id: cleanAd.id,
      //     address: cleanAd.address,
      //     city: cleanAd.city,
      //     district: filteredResult.districtName,
      //     isFake: isFake(mainCity),
      //     dpe: cleanAd.dpe,
      //     rentComplement: cleanAd.rentComplement,
      //     hasFurniture: cleanAd.hasFurniture,
      //     isHouse: cleanAd.isHouse,
      //     postalCode: cleanAd.postalCode,
      //     price: cleanAd.price,
      //     renter: cleanAd.renter,
      //     roomCount: cleanAd.roomCount,
      //     stations: cleanAd.stations,
      //     surface: cleanAd.surface,
      //     yearBuilt: cleanAd.yearBuilt,
      //     isLegal,
      //     latitude: cleanAd.coordinates?.lat,
      //     longitude: cleanAd.coordinates?.lng,
      //     maxPrice: maxAuthorized,
      //     priceExcludingCharges,
      //     website: this.website,
      //     url: url && `${url.origin}${url.pathname}`,
      //   }).save()

      //   return new SerializerService(
      //     {
      //       ...cleanAd,
      //       isLegal,
      //       maxAuthorized,
      //       priceExcludingCharges,
      //     },
      //     filteredResult,
      //   ).serialize()
      // } else {
      //   throw {
      //     error: ERROR_CODE.Filter,
      //     msg: 'no match found',
      //     isIncompleteAd: true,
      //   }
      // }
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
