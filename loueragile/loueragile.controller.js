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
            digData(loueragileService.apiMapping(JSON.parse(body)),
                (data) => {
                    res.json(data)
                }, (err) => {
                    res.status(err.status).json(err)
                })
        }
    })
}

function digData(ad, onSuccess, onError) {
    const {
        roomCount,
        hasFurniture,
        surface,
        price,
        address,
        postalCode,
        city,
        coordinates,
        yearBuilt,
        renter,
        stations,
        charges,
        hasCharges,
    } = digService.main(ad)

    if (price && surface) {
        if (coordinates || address || postalCode) {
            if (!(city && cleanup.string(city) === 'paris')) {
                log.error('not in Paris')
                onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    coordinates: coordinates,
                    hasFurniture: hasFurniture,
                    postalCode: postalCode,
                    roomCount: roomCount,
                    stations: roomCount,
                    yearBuilt: yearBuilt,
                }).then(({ match }) => {
                    if (match) {
                        const maxAuthorized = roundNumber(+match.fields.max * surface)
                        const priceExcludingCharges = chargesService.subCharges(price, charges, hasCharges)
                        const isLegal = priceExcludingCharges <= maxAuthorized

                        saverService.rent({
                            id: ad.id,
                            address: address,
                            city: city,
                            hasFurniture: hasFurniture,
                            isLegal,
                            latitude: coordinates && coordinates.lat,
                            longitude: coordinates && coordinates.lng,
                            maxPrice: maxAuthorized,
                            postalCode: postalCode,
                            price: price,
                            priceExcludingCharges,
                            renter: renter,
                            roomCount: roomCount,
                            stations: stations,
                            surface: surface,
                            website: 'loueragile',
                            yearBuilt: yearBuilt,
                        })

                        onSuccess(serializer({
                            address: address,
                            charges: charges,
                            hasCharges: hasCharges,
                            hasFurniture: hasFurniture,
                            maxAuthorized,
                            postalCode: postalCode,
                            price: price,
                            priceExcludingCharges,
                            roomCount: roomCount,
                            surface: surface,
                            yearBuilt: yearBuilt,
                        }, match))
                    } else {
                        log.error('no match found')
                        onError({ status: 403, msg: 'no match found', error: 'address' })
                    }
                })
            }
        } else {
            log.error('no address found')
            onError({ status: 403, msg: 'no address found', error: 'address' })
        }
    } else {
        log.error('minimal information not found')
        onError({ status: 403, msg: 'minimal information not found', error: 'minimal' })
    }
}

module.exports = router
