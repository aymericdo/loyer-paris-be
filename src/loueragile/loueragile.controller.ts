import express from 'express'
const router = express.Router()
const request = require('request')
import * as loueragileService from './loueragile.service'
import * as log from './../helper/log.helper'
import { roundNumber } from '../helper/round-number.helper'
import * as cleanup from '../helper/cleanup.helper'
import * as digService from '../service/dig.service'
import { serializeRent } from '../service/serialize-rent.service'
import { rentFilter } from '../service/rent-filter.service'
import { saveRent } from '../service/save-rent.service'
import * as chargesService from '../service/charges.service'
import { errorEscape } from '../service/error-escape.service'

// routes
router.get('/', getById)
function getById(req, res, next) {
    log.info(`-> ${req.baseUrl}/${req.query.id} getById`, 'blue')
    if (!cleanup.number(req.query.id)) {
        res.status(403).json({
            msg: 'no address found', error: 'address',
        })
    }
    request({
        url: `https://www.loueragile.fr/apiv2/alert/${process.env.LOUER_AGILE_API_KEY}/ad/${req.query.id}`,
    }, (error, response, body) => {
        if (!body || !!error) {
            log.error('l\'api de loueragile bug')
            res.status(403).json({ status: 403, msg: 'l\'api de loueragile bug', error: 'api' })
        } else {
            log.info('loueragile fetched')
            digData(loueragileService.apiMapping(JSON.parse(body)))
                .then((data) => {
                    res.json(data)
                })
                .catch((err) => {
                    console.log(err)
                    res.status(err.status).json(err)
                })
        }
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
            stations,
            surface,
            website: 'loueragile',
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
