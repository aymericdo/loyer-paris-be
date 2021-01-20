import { subCharges } from '@helpers/charges'
import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { Ad, CleanAd } from '@interfaces/ad'
import { EncadrementItem } from '@interfaces/json-item'
import { Mapping } from '@interfaces/mapping'
import { DigService } from '@services/dig'
import { ErrorService } from '@services/error-escape'
import { RentFilterService } from '@services/filter-rent'
import { SaveRentService } from '@services/save-rent'
import { SerializeRentService } from '@services/serialize-rent'
import { Response } from 'express'

export abstract class Website {
    website: string = null
    id: string = null
    body: Mapping = null

    constructor(props) {
        this.id = props.id
        this.body = props.body
    }

    analyse(res: Response): void {
        this.digData()
            .then((data) => {
                res.json(data)
            })
            .catch((err) => {
                console.log(err)
                if (err.status) {
                    res.status(err.status).json(err)
                } else {
                    log.error('Error 500')
                    res.status(500).json(err)
                }
            })
    }

    abstract mapping(): Promise<Ad>

    async digData() {
        if (this.body && this.body.noMoreData) {
            ErrorService.noMoreData()
        }

        const ad: Ad = await this.mapping()

        const cleanAd: CleanAd = await new DigService(ad).digInAd()

        ErrorService.errorEscape(cleanAd)

        const adEncadrement: EncadrementItem = new RentFilterService(cleanAd).filter()

        if (adEncadrement) {
            const maxAuthorized = roundNumber(+adEncadrement.fields.max * cleanAd.surface)
            const priceExcludingCharges = subCharges(cleanAd.price, cleanAd.charges, cleanAd.hasCharges)
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
            log.error('no match found')
            throw { status: 403, msg: 'no match found', error: 'address' }
        }
    }
}
