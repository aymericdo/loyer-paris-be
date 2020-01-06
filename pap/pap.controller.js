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
    const digServiceData = digService.main(ad)

    if (digServiceData.price && digServiceData.surface) {
        if (digServiceData.address || digServiceData.postalCode) {
            if (!(digServiceData.city && cleanup.string(digServiceData.city) === 'paris')) {
                log.error('not in Paris')
                onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    address: digServiceData.address,
                    city: digServiceData.city,
                    hasFurniture: digServiceData.hasFurniture,
                    postalCode: digServiceData.postalCode,
                    roomCount: digServiceData.roomCount,
                    stations: digServiceData.stations,
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
                            website: 'pap',
                            yearBuilt: digServiceData.yearBuilt,
                        })

                        onSuccess(serializer({
                            address: digServiceData.address,
                            charges: digServiceData.charges,
                            hasCharges: digServiceData.hasCharges,
                            hasFurniture: digServiceData.hasFurniture,
                            isLegal,
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
