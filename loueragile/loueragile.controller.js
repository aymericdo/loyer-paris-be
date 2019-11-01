const express = require('express')
const router = express.Router()
const request = require('request')
const loueragileService = require('./loueragile.service')
const log = require('helper/log.helper')
const cleanup = require('helper/cleanup.helper')
const digService = require('service/dig.service')
const serializer = require('service/serializer.service')
const rentFilter = require('service/rent-filter.service')
const saverService = require('service/saver.service')

// routes
router.get('/', getById)
function getById(req, res, next) {
    log(`-> ${req.baseUrl} getById`, 'blue')
    if (!cleanup.number(req.query.id)) {
        res.status(403).json({
            msg: 'no address found', error: 'address',
        })
    }
    request({
        url: `https://www.loueragile.fr/apiv2/alert/${process.env.LOUER_AGILE_API_KEY}/ad/${req.query.id}`,
    }, (error, response, body) => {
        if (!body || !!error) {
            log('error -> l\'api de loueragile bug')
            res.status(403).json({ status: 403, msg: 'l\'api de loueragile bug', error: 'api' })
        } else {
            log('loueragile fetched')
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
                        website: 'loueragile',
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
