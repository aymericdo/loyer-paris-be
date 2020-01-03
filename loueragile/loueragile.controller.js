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
    const roomCount = digService.digForRoomCount(ad)
    const hasFurniture = digService.digForHasFurniture(ad)
    const surface = digService.digForSurface(ad)
    const price = digService.digForPrice(ad)
    const [address, postalCode, city] = digService.digForAddress(ad)
    const coordinates = digService.digForCoordinates(ad, address, postalCode, city)
    const yearBuilt = digService.digForYearBuilt(ad, coordinates, postalCode)
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
                            website: 'loueragile',
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
