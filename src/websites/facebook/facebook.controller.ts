import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as facebookService from './facebook.service'
import * as log from '@helpers/log'
import * as digService from '@services/dig'
import { serializeRent } from '@services/serialize-rent'
import { rentFilter } from '@services/rent-filter'
import { saveRent } from '@services/save-rent'
import * as chargesService from '@services/charges'
import { errorEscape } from '@services/error-escape'
import { roundNumber } from '@helpers/round-number'
import { Ad } from '@interfaces/ad'

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    digData(facebookService.dataMapping(req.body))
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.status(err.status).json(err)
        })
}

async function digData(ad: Ad) {
    const {
        address,
        charges,
        city,
        coordinates,
        hasCharges,
        hasFurniture,
        postalCode,
        price,
        renter,
        roomCount,
        stations,
        surface,
        yearBuilt,
    } = await digService.main(ad)

    errorEscape({
        address,
        city,
        postalCode,
        price,
        surface,
    })

    const adEncadrement = rentFilter({
        coordinates,
        hasFurniture,
        postalCode,
        roomCount,
        stations,
        yearBuilt,
    })

    if (adEncadrement) {
        const maxAuthorized = roundNumber(+adEncadrement.fields.max * surface)
        const priceExcludingCharges = chargesService.subCharges(price, charges, hasCharges)
        const isLegal = priceExcludingCharges <= maxAuthorized

        saveRent({
            id: ad.id,
            address,
            city,
            hasFurniture,
            isLegal,
            latitude: coordinates && coordinates.lat,
            longitude: coordinates && coordinates.lng,
            maxPrice: maxAuthorized,
            postalCode,
            priceExcludingCharges,
            price,
            renter,
            roomCount,
            stations,
            surface,
            website: 'facebook',
            yearBuilt,
        })

        return serializeRent({
            address,
            charges,
            hasCharges,
            hasFurniture,
            isLegal,
            maxAuthorized,
            postalCode,
            price,
            priceExcludingCharges,
            roomCount,
            surface,
            yearBuilt,
        }, adEncadrement)
    } else {
        log.error('no match found')
        throw { status: 403, msg: 'no match found', error: 'address' }
    }
}

module.exports = router
