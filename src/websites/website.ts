import { getPriceExcludingCharges } from '@helpers/charges'
import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { Ad, CleanAd } from '@interfaces/ad'
import { EncadrementItem } from '@interfaces/json-item'
import { Mapping } from '@interfaces/mapping'
import { ApiError } from '@interfaces/shared'
import { ApiErrorsService, ErrorCode } from '@services/api-errors'
import { DigService } from '@services/dig'
import { RentFilterService } from '@services/filter-rent'
import { SaveRentService } from '@services/save-rent'
import { SerializeRentService } from '@services/serialize-rent'
import { Response } from 'express'

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
        if (this.body?.noMoreData) {
            throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
        }

        const ad: Ad = await this.mapping()

        const cleanAd: CleanAd = await new DigService(ad).digInAd()
        const adEncadrement: EncadrementItem = new RentFilterService(cleanAd).filter()

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
    }
}
