import { getPriceExcludingCharges } from '@helpers/charges'
import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { Ad, CleanAd, FilteredResult } from '@interfaces/ad'
import { Mapping } from '@interfaces/mapping'
import { ApiError } from '@interfaces/shared'
import { AvailableCities, CityService } from '@services/city'
import { ApiErrorsService, ErrorCode } from '@services/api-errors'
import { GeoFinderService } from '@services/geofinder'
import { SaveRentService } from '@services/save-rent'
import { SerializeRentService } from '@services/serialize-rent'
import { Response } from 'express'
import { RentFilter } from '@rentfilters/rentfilter'

export abstract class Website {
    website: string = null
    body: Mapping = null
    isV2: boolean = null

    constructor(props: { body: Mapping, id?: string }, v2: boolean = false) {
        this.body = props.body
        this.isV2 = v2
    }

    analyse(res: Response): void {
        this.digData()
            .then((data) => {
                res.json(data)
            })
            .catch((err: ApiError) => {
                if (err.error) {
                    const status = ApiErrorsService.getStatus(err)
                    res.status(status).json(err)
                } else {
                    console.log(err)
                    log.error('ERROR 500')
                    res.status(500).json(err)
                }
            })
    }

    abstract mapping(): Promise<Ad>

    async digData() {
        const ad: Ad = await this.mapping()

        const city: AvailableCities = CityService.findCity(ad)
        const cleanAd: CleanAd = await new GeoFinderService(city, ad).digInAd()
        const rentFilter = new RentFilter(city)
        const filteredResult: FilteredResult = rentFilter.filter(cleanAd)

        if (filteredResult) {
            const maxAuthorized = roundNumber(filteredResult.maxPrice * cleanAd.surface)
            const priceExcludingCharges = getPriceExcludingCharges(cleanAd.price, cleanAd.charges, cleanAd.hasCharges)
            const isLegal = priceExcludingCharges <= maxAuthorized

            await new SaveRentService({
                ...cleanAd,
                isLegal,
                latitude: cleanAd.coordinates?.lat,
                longitude: cleanAd.coordinates?.lng,
                maxPrice: maxAuthorized,
                priceExcludingCharges,
                website: this.website,
            }).save()

            return new SerializeRentService({
                ...cleanAd,
                isLegal,
                maxAuthorized,
                priceExcludingCharges,
            }, filteredResult).serialize()
        } else {
            throw { error: ErrorCode.Filter, msg: 'no match found' }
        }
    }
}
