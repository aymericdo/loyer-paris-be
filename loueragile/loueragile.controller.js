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
    const digServiceData = digService.main(ad)

    if (digServiceData.price && digServiceData.surface) {
        if (digServiceData.coordinates || digServiceData.address || digServiceData.postalCode) {
            if (!(digServiceData.city && cleanup.string(digServiceData.city) === 'paris')) {
                log.error('not in Paris')
                onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    coordinates: digServiceData.coordinates,
                    hasFurniture: digServiceData.hasFurniture,
                    postalCode: digServiceData.postalCode,
                    roomCount: digServiceData.roomCount,
                    stations: digServiceData.roomCount,
                    yearBuilt: digServiceData.yearBuilt,
                }).then(({ match }) => {
                    if (match) {
                        const maxAuthorized = roundNumber(+match.fields.max * digServiceData.surface)
                        const priceExcludingCharges = chargesService.subCharges(digServiceData.price, digServiceData.charges, digServiceData.hasCharges)
                        const isLegal = priceExcludingCharges <= maxAuthorized

                        saverService.rent({
                            id: ad.id,
                            address: digServiceData.address,
                            city: digServiceData.city,
                            hasFurniture: digServiceData.hasFurniture,
                            isLegal,
                            latitude: digServiceData.coordinates && digServiceData.coordinates.lat,
                            longitude: digServiceData.coordinates && digServiceData.coordinates.lng,
                            maxPrice: maxAuthorized,
                            postalCode: digServiceData.postalCode,
                            price: digServiceData.price,
                            priceExcludingCharges,
                            renter: digServiceData.renter,
                            roomCount: digServiceData.roomCount,
                            stations: digServiceData.stations,
                            surface: digServiceData.surface,
                            website: 'loueragile',
                            yearBuilt: digServiceData.yearBuilt,
                        })

                        onSuccess(serializer({
                            address: digServiceData.address,
                            charges: digServiceData.charges,
                            hasCharges: digServiceData.hasCharges,
                            hasFurniture: digServiceData.hasFurniture,
                            maxAuthorized,
                            postalCode: digServiceData.postalCode,
                            price: digServiceData.price,
                            priceExcludingCharges,
                            roomCount: digServiceData.roomCount,
                            surface: digServiceData.surface,
                            yearBuilt: digServiceData.yearBuilt,
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
