const express = require('express')
const router = express.Router()
const papService = require('./pap.service')
const log = require('helper/log.helper')
const digService = require('service/dig.service')
const roundNumber = require('helper/round-number.helper')
const serializer = require('service/serializer.service')
const rentFilter = require('service/rent-filter.service')
const saverService = require('service/saver.service')
const chargesService = require('service/charges.service')

// routes
router.post('/data', getByData)

function getByData(req, res, next) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    digData(papService.dataMapping(req.body),
        (data) => {
            res.json(data)
        }, (err) => {
            res.status(err.status).json(err)
        })
}

function digData(ad, onSuccess, onError) {
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
    } = digService.main(ad)

    if (price && surface) {
        if (address || postalCode) {
            if (!(city && cleanup.string(city) === 'paris')) {
                log.error('not in Paris')
                onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    address,
                    city,
                    hasFurniture,
                    postalCode,
                    roomCount,
                    stations,
                    yearBuilt,
                }).then(({ match }) => {
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
                            website: 'pap',
                            yearBuilt,
                        })

                        onSuccess(serializer({
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
