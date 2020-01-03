const express = require('express')
const router = express.Router()
const leboncoinService = require('./leboncoin.service')
const digService = require('service/dig.service')
const log = require('helper/log.helper')
const roundNumber = require('helper/round-number.helper')
const serializer = require('service/serializer.service')
const rentFilter = require('service/rent-filter.service')
const saverService = require('service/saver.service')
const chargesService = require('service/charges.service')

// routes
router.post('/data', getByData)

function getByData(req, res, next) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    digData(leboncoinService.dataMapping(req.body),
        (data) => {
            res.json(data)
        }, (err) => {
            res.status(err.status).json(err)
        })
}

function digData(ad, onSuccess, onError) {
    const coordinates = digService.digForCoordinates(ad)
    const yearBuilt = digService.digForYearBuilt(ad)
    const roomCount = digService.digForRoomCount(ad)
    const hasFurniture = digService.digForHasFurniture(ad)
    const surface = digService.digForSurface(ad)
    const price = digService.digForPrice(ad)
    const [address, postalCode, city] = digService.digForAddress(ad)
    const renter = digService.digForRenter(ad)
    const stations = digService.digForStations(ad)
    const charges = digService.digForCharges(ad)
    const hasCharges = digService.digForHasCharges(ad)

    if (price && surface) {
        if (coordinates || address || postalCode) {
            if (!(city && cleanup.string(city) === 'paris')) {
                log.error('not in Paris')
                onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    address,
                    city,
                    coordinates,
                    hasFurniture,
                    postalCode,
                    roomCount,
                    stations,
                    yearBuilt,
                }).then(({ match, coord }) => {
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
                            latitude: coordinates && coordinates.lat || coord && coord.lat,
                            longitude: coordinates && coordinates.lng || coord && coord.lng,
                            maxPrice: maxAuthorized,
                            postalCode,
                            price,
                            priceExcludingCharges,
                            renter,
                            roomCount,
                            stations,
                            surface,
                            website: 'leboncoin',
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
