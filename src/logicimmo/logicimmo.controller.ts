import express from 'express'
const router = express.Router()
import * as logicimmoService from './logicimmo.service'
import * as digService from '../service/dig.service'
import * as log from './../helper/log.helper'
import { roundNumber } from '../helper/round-number.helper'
import { serializeRent } from '../service/serialize-rent.service'
import { rentFilter } from '../service/rent-filter.service'
import { saveRent } from '../service/save-rent.service'
import * as chargesService from '../service/charges.service'
import { errorEscape } from '../service/error-escape.service'

// routes
router.post('/data', getByData)

function getByData(req, res, next) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    digData(logicimmoService.dataMapping(req.body))
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.status(err.status).json(err)
        })
}

async function digData(ad) {
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
            price,
            priceExcludingCharges,
            renter,
            roomCount,
            surface,
            stations,
            website: 'logicimmo',
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
