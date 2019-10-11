const express = require('express')
const router = express.Router()
const addressService = require('../service/address.service')
const papService = require('./pap.service')
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
    digData(req.body, (data) => {
        if (data) {
            res.json(data)
        } else {
            res.status(409).json({
                error: 'no address found',
            })
        }
    })
}

function digData(ad, callback) {
    const yearBuilt = papService.digForYearBuilt(ad)
    const roomCount = papService.digForRoomCount(ad)
    const hasFurniture = papService.digForHasFurniture(ad)
    const surface = papService.digForSurface(ad)
    const price = papService.digForPrice(ad)
    const [address, postalCode] = papService.digForAddress(ad)

    if (address || postalCode) {
        getDistrict(address, postalCode)
            .then((districts) => {
                callback(serializer({
                    id: ad.list_id,
                    address: `${address ? address : ''} ${postalCode ? postalCode : ''}`,
                    districts,
                    hasFurniture,
                    price,
                    roomCount,
                    surface,
                    yearBuilt,
                }))
            })
    } else {
        return null
    }
}

function getDistrict(address, postalCode) {
    return address ?
        addressService.getCoordinate(`${address} ${postalCode ? postalCode : ''}`)
            .then((info) => {
                log('info address fetched')
                return info && [addressService.getDistrictFromCoordinate(info.geometry.lng, info.geometry.lat)]
            })
        : postalCode ?
            Promise.resolve(addressService.getDistrictFromPostalCode(postalCode))
            :
            Promise.resolve([])
}

module.exports = router
