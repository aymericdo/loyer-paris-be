const express = require('express')
const router = express.Router()
const request = require('request')
const addressService = require('../service/address.service')
const leboncoinService = require('./leboncoin.service')
const log = require('../helper/log.helper')
const serializer = require('./../helper/serializer.helper')
const tr = require('tor-request')

tr.TorControlPort.password = process.env.TOR_PASSWORD

//print current ip
tr.request('https://api.ipify.org', function (err, res, body) {
    if (!err && res.statusCode == 200) {
        console.log("Your public (through Tor) IP is: " + body);
    }
});

// routes
router.get('/', getById)
router.post('/data', getByData)
router.get('/new', () => {
    //renew to new ip
    console.log('new ?')
    tr.renewTorSession(function (err, msg) {
        console.log(err)
        if (msg) {
            printTOR_IP();
        }
    });
})

function getByData(req, res, next) {
    log('getByData')
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

function getById(req, res, next) {
    log('getById')
    request({
        url: `https://api.leboncoin.fr/finder/classified/${req.query.id}`,
    }, (error, response, body) => {
        log('leboncoin fetched')
        const ad = JSON.parse(body)
        if (ad.body) {
            digData(ad, (data) => {
                if (data) {
                    res.json(data)
                } else {
                    res.status(409).json({
                        error: 'no address found',
                    })
                }
            })
        } else {
            res.status(409).json({
                error: 'no body found',
            })
        }
    })
}

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

function digData(ad, callback) {
    const coordinates = leboncoinService.digForCoordinates(ad)
    const yearBuilt = leboncoinService.digForYearBuilt(ad)
    const roomCount = leboncoinService.digForRoomCount(ad)
    const hasFurniture = leboncoinService.digForHasFurniture(ad)
    const surface = leboncoinService.digForSurface(ad)
    const price = leboncoinService.digForPrice(ad)
    const address = leboncoinService.digForAddress(ad)

    if (coordinates || address) {
        getDistrict(coordinates, address)
            .then((district) => {
                callback(serializer({
                    id: ad.list_id,
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
        return null
    }
}

module.exports = router
