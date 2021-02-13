import { getPriceExcludingCharges } from '@helpers/charges'
import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { Digger } from '@interfaces/diggers'
import { EncadrementItem } from '@interfaces/json-item'
import { Mapper } from '@interfaces/mappers'
import { ApiError } from '@interfaces/shared'
import { ApiErrorsService, ErrorCode } from '@services/api-errors'
import { RentFilterService } from '@services/filter-rent'
import { SaveRentService } from '@services/save-rent'
import { SerializeRentService } from '@services/serialize-rent'
import express, { NextFunction, Request, Response } from 'express'

const router = express.Router()

router.get('/', analyse)
function analyse(req: Request, res: Response, _: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    digData()
        .then((data) => {
            res.json(data)
        })
        .catch((err: ApiError) => {
            if (err.error) {
                const status = ApiErrorsService.getStatus(err)
                res.status(status).json(err)
            } else {
                log.error('ERROR 500')
                res.status(500).json(err)
            }
        })
}

async function digData() {
    if (this.body?.noMoreData) {
        throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
    }

    const mapper = new Mapper(this.website, this.body)
    const ad = await mapper.mapping()
    const digger = new Digger(ad.cityLabel)
    const cleanAd = await digger.digInAd()
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

module.exports = router
