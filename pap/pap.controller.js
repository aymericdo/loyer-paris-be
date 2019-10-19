const express = require('express')
const router = express.Router()
const papService = require('./pap.service')
const log = require('../helper/log.helper')
const digService = require('./../service/dig.service')
const serializer = require('./../service/serializer.service')
const rentFilter = require('./../service/rent-filter.service')
const saverService = require('./../service/saver.service')

// routes
router.post('/data', getByData)

function getByData(req, res, next) {
    log(`-> ${req.baseUrl} getByData`, 'blue')
    digData(papService.dataMapping(req.body),
        (data) => {
            res.json(data)
        }, (err) => {
            res.status(err.status).json(err)
        })
}

function digData(ad, onSuccess, onError) {
    const yearBuilt = digService.digForYearBuilt(ad)
    const roomCount = digService.digForRoomCount(ad)
    const city = digService.digForCity(ad)
    const hasFurniture = digService.digForHasFurniture(ad)
    const surface = digService.digForSurface(ad)
    const price = digService.digForPrice(ad)
    const [address, postalCode] = digService.digForAddress(ad)

    if (address || postalCode) {
        if (city && !!city.length && city.toLowerCase() !== 'paris') {
            log('error -> not in Paris')
            onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
        } else {
            rentFilter({
                address,
                hasFurniture,
                postalCode,
                roomCount,
                yearBuilt,
            }).then(({ match, coord }) => {
                if (match) {
                    const serializedData = serializer({
                        id: ad.id,
                        address,
                        postalCode,
                        hasFurniture,
                        price,
                        roomCount,
                        surface,
                        yearBuilt,
                    }, match)

                    saverService.rent({
                        id: serializedData.id,
                        website: 'pap',
                        address,
                        postalCode,
                        longitude: coord && coord.lng,
                        latitude: coord && coord.lat,
                        hasFurniture,
                        roomCount,
                        yearBuilt,
                        price,
                        surface,
                        maxPrice: serializedData.computedInfo.maxAuthorized,
                        isLegal: serializedData.isLegal,
                        // renter,
                    })

                    onSuccess(serializedData)
                } else {
                    log('error -> no match found')
                    res.status(403).json({
                        msg: 'no match found', error: 'address',
                    })
                }
            })
        }
    } else {
        log('error -> no address found')
        onError({ status: 403, msg: 'no address found', error: 'address' })
    }
}

module.exports = router
