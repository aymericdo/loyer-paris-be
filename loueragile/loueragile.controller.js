const express = require('express')
const router = express.Router()
const request = require('request')
const loueragileService = require('./loueragile.service')
const log = require('helper/log.helper')
const roundNumber = require('helper/round-number.helper')
const cleanup = require('helper/cleanup.helper')
const digService = require('service/dig.service')
const serializer = require('service/serializer.service')
const rentFilter = require('service/rent-filter.service')
const saverService = require('service/saver.service')
const chargesService = require('service/charges.service')
const errorEscape = require('service/error-escape.service')

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

    const { match } = rentFilter({
        address,
        city,
        coordinates,
        hasFurniture,
        postalCode,
        roomCount,
        stations,
        yearBuilt,
    })

    if (match) {
        const maxAuthorized = roundNumber(+match.fields.max * surface)
        const priceExcludingCharges = chargesService.subCharges(price, charges, hasCharges)
        const isLegal = priceExcludingCharges <= maxAuthorized

        saverService.rent({
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

        return serializer({
            address,
            charges,
            hasCharges,
            hasFurniture,
            maxAuthorized,
            postalCode,
            price,
            priceExcludingCharges,
            roomCount,
            surface,
            yearBuilt,
        }, match)
    } else {
        log.error('no match found')
        throw { status: 403, msg: 'no match found', error: 'address' }
    }
}

module.exports = router
