const express = require('express')
const router = express.Router()
const addressService = require('../service/address.service')
const lefigaroService = require('./lefigaro.service')
const digService = require('./../service/dig.service')
const log = require('../helper/log.helper')
const serializer = require('./../helper/serializer.helper')

// routes
router.get('/', getById)
router.post('/data', getByData)

function getById(req, res, next) {
    log(`-> ${req.baseUrl} getById`)
}

function getByData(req, res, next) {
    log(`-> ${req.baseUrl} getByData`)
    digData(lefigaroService.dataMapping(req.body),
        (data) => {
            res.json(data)
        }, (err) => {
            res.status(err.status).json(err)
        })
}

function digData(ad, onSuccess, onError) {
    const yearBuilt = digService.digForYearBuilt(ad)
    const city = digService.digForCity(ad)
    const roomCount = digService.digForRoomCount(ad)
    const hasFurniture = digService.digForHasFurniture(ad)
    const surface = digService.digForSurface(ad)
    const price = digService.digForPrice(ad)
    const [address, postalCode] = digService.digForAddress(ad)

    if (address || postalCode) {
        if (city && !!city.length && city.toLowerCase() !== 'paris') {
            log(`error -> not in Paris`)
            onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
        } else {
            addressService.getDistrict(null, address, postalCode)
                .then((districts) => {
                    onSuccess(serializer({
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
        onError({ status: 403, msg: 'no address found', error: 'address' })
    }
}

module.exports = router
