const express = require('express')
const router = express.Router()
const request = require('request')
const addressService = require('../service/address.service')
const loueragileService = require('./loueragile.service')
const digService = require('./../service/dig.service')
const log = require('../helper/log.helper')
const serializer = require('./../helper/serializer.helper')

// routes
router.get('/', getById)

function getById(req, res, next) {
    log(`-> ${req.baseUrl} getById`)
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

        if (coordinates || address || postalCode) {
            if (city && !!city.length && city.toLowerCase() !== 'paris') {
                log(`error -> not in Paris`)
                res.status(400).json({ msg: 'not in Paris bro', error: 'paris' })
            } else {
                addressService.getDistrict(coordinates, address, postalCode)
                    .then((districts) => {
                        res.json(serializer({
                            id: ad.id,
                            address,
                            postalCode,
                            districts,
                            hasFurniture,
                            price,
                            roomCount,
                            surface,
                            yearBuilt,
                        }))
                    })
            }
        } else {
            log(`error -> no address found`)
            res.status(403).json({
                msg: 'no address found', error: 'address',
            })
        }
    })
}

module.exports = router
