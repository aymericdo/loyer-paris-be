import { getPriceExcludingCharges } from '@helpers/charges'
import * as cleanup from '@helpers/cleanup'
import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { Ad, CleanAd } from '@interfaces/ad'
import { EncadrementItem } from '@interfaces/json-item'
import { Mapping } from '@interfaces/mapping'
import { ApiError } from '@interfaces/shared'
import { AddressService } from '@services/address'
import { ApiErrorsService, ErrorCode } from '@services/api-errors'
import { CityService } from '@services/city'
import { DigService } from '@services/dig'
import { RentFilterService } from '@services/filter-rent'
import { SaveRentService } from '@services/save-rent'
import { SerializeRentService } from '@services/serialize-rent'
import { Response } from 'express'


export abstract class Website {
    website: string = null
    body: Mapping = null

    constructor(props: { body: Mapping }) {
        this.body = props.body
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
        if (this.body?.noMoreData) {
            throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
        }
        try {
            const ad: Ad = await this.mapping()
            const cityService = new CityService(ad)
            const cityInfo = cityService.getCityInfo()
            const cleanAd: CleanAd = await new DigService(cityInfo.city, ad).digInAd()

<<<<<<< HEAD
            const adEncadrement: EncadrementItem = new RentFilterService(cityInfo.city, cleanAd).filter()
=======
        const ad: Ad = await this.mapping()

        const cleanAd: CleanAd = await new DigService(ad).digInAd()
        const adEncadrement: EncadrementItem = new RentFilterService(cleanAd).filter()
>>>>>>> 1e3b4c8e5fbff1c4d60c311ad7dafdc1c47760a1

            if (adEncadrement) {
                const maxAuthorized = roundNumber(+adEncadrement.fields.max * cleanAd.surface)
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
                }, adEncadrement).serialize()
            } else {
                throw { error: ErrorCode.Filter, msg: 'no match found' }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
