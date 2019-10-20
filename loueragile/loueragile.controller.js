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
        log('loueragile fetched')
        const ad = loueragileService.apiMapping(JSON.parse(body))

        const coordinates = digService.digForCoordinates(ad)
        const yearBuilt = digService.digForYearBuilt(ad)
        const city = digService.digForCity(ad)
        const roomCount = digService.digForRoomCount(ad)
        const hasFurniture = digService.digForHasFurniture(ad)
        const surface = digService.digForSurface(ad)
        const price = digService.digForPrice(ad)
        const [address, postalCode] = digService.digForAddress(ad)
        const renter = digService.digForRenter(ad)

        if (coordinates || address || postalCode) {
            if (city && !!city.length && city.toLowerCase() !== 'paris') {
                log('error -> not in Paris')
                res.status(400).json({ msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    address,
                    coordinates,
                    hasFurniture,
                    postalCode,
                    roomCount,
                    yearBuilt,
                }).then(({ match, coord }) => {
                    if (match) {
                        const maxAuthorized = +match.fields.max * +surface
                        const isLegal = +price <= maxAuthorized

                        saverService.rent({
                            id: ad.id,
                            address,
                            hasFurniture,
                            isLegal,
                            latitude: coordinates && coordinates.lat || coord && coord.lat,
                            longitude: coordinates && coordinates.lng || coord && coord.lng,
                            maxPrice: maxAuthorized,
                            postalCode,
                            price,
                            renter,
                            roomCount,
                            surface,
                            website: 'loueragile',
                            yearBuilt,
                        })

                        res.json(serializer({
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
                        res.status(403).json({
                            msg: 'no match found', error: 'address',
                        })
                    }
                })
            }
        } else {
            log('error -> no address found')
            res.status(403).json({
                msg: 'no address found', error: 'address',
            })
        }
    })
}

module.exports = router
