const express = require('express')
const router = express.Router()
const request = require('request')
const addressService = require('../service/address.service')
const loueragileService = require('./loueragile.service')
const log = require('../helper/log.helper')
const serializer = require('./../helper/serializer.helper')

// routes
router.get('/', getById)

function getDistrict(coordinates, address) {
    return coordinates ?
        Promise.resolve(addressService.getDistrictFromCoordinate(coordinates.lng, coordinates.lat))
        :
        addressService.getCoordinate(address)
            .then((info) => {
                log('info address fetched')
                return info && addressService.getDistrictFromCoordinate(info.geometry.lng, info.geometry.lat)
            })
}

function getById(req, res, next) {
    log('getById')
    request({
        url: `https://www.loueragile.fr/apiv2/alert/${process.env.LOUER_AGILE_API_KEY}/ad/${req.query.id}`,
    }, (error, response, body) => {
        log('loueragile fetched')
        const ad = JSON.parse(body)

        const coordinates = loueragileService.digForCoordinates(ad)
        const yearBuilt = loueragileService.digForYearBuilt(ad)
        const roomCount = loueragileService.digForRoomCount(ad)
        const hasFurniture = loueragileService.digForHasFurniture(ad)
        const surface = loueragileService.digForSurface(ad)
        const price = loueragileService.digForPrice(ad)
        const address = loueragileService.digForAddress(ad)

        if (coordinates || address) {
            getDistrict(coordinates, address)
                .then((district) => {
                    res.json(serializer({
                        id: ad.ad.id,
                        address,
                        district,
                        hasFurniture,
                        price,
                        roomCount,
                        surface,
                        yearBuilt,
                    }))
                })
        } else {
            res.status(409).json({
                error: 'no address found',
            })
        }
    })
}

module.exports = router
