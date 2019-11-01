const express = require('express')
const router = express.Router()
const leboncoinService = require('./leboncoin.service')
const digService = require('service/dig.service')
const log = require('helper/log.helper')
const serializer = require('service/serializer.service')
const rentFilter = require('service/rent-filter.service')
const saverService = require('service/saver.service')

// routes
router.post('/data', getByData)

function getByData(req, res, next) {
    log(`-> ${req.baseUrl} getByData`, 'blue')
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

    if (coordinates || address || postalCode) {
        if (city && !!city.length && city.toLowerCase() !== 'paris') {
            log('error -> not in Paris')
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
                    const maxAuthorized = +match.fields.max * +surface
                    const isLegal = +price <= maxAuthorized

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
                        renter,
                        roomCount,
                        stations,
                        surface,
                        website: 'leboncoin',
                        yearBuilt,
                    })

                    onSuccess(serializer({
                        address,
                        hasFurniture,
                        isLegal,
                        maxAuthorized,
                        postalCode,
                        price,
                        roomCount,
                        surface,
                        yearBuilt,
                    }, match))
                } else {
                    log('error -> no match found')
                    onError({ status: 403, msg: 'no match found', error: 'address' })
                }
            })
        }
    } else {
        log('error -> no address found')
        onError({ status: 403, msg: 'no address found', error: 'address' })
    }
}

module.exports = router
