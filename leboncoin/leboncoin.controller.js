const express = require('express')
const router = express.Router()
const fakeUa = require('fake-useragent')
const addressService = require('../service/address.service')
const leboncoinService = require('./leboncoin.service')
const log = require('../helper/log.helper')
const serializer = require('./../helper/serializer.helper')
const tr = require('tor-request')

tr.TorControlPort.password = process.env.TOR_PASSWORD

let requestsCount = 0

// routes
router.get('/', getById)
router.post('/data', getByData)

function getById(req, res, next) {
    log(`-> ${req.baseUrl} getById`)
    let renewTorSessionPromise = Promise.resolve({})

    if (requestsCount > 10) {
        requestsCount = 0
        renewTorSessionPromise = new Promise((resolve) => {
            tr.renewTorSession((err, msg) => {
                if (msg) {
                    console.log(msg)
                    resolve(msg)
                } else {
                    console.log(err)
                }
            })
        })
    }

    renewTorSessionPromise.then(() => {
        tr.request({
            url: `https://api.leboncoin.fr/finder/classified/${req.query.id}`,
            headers: {
                'api_key': 'ba0c2dad52b3ec',
                'Content-Type': 'application/json',
                'Origin': 'https://www.leboncoin.fr',
                'Referer': `https://www.leboncoin.fr/locations/${req.query.id}.htm/`,
                'Sec-Fetch-Mode': 'cors',
                'User-Agent': fakeUa(),
            },
        }, (error, response, body) => {
            log('leboncoin fetched')
            console.log(response)
            console.log(body)
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
    })

    requestsCount += 1
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
    const coordinates = leboncoinService.digForCoordinates(ad)
    const yearBuilt = leboncoinService.digForYearBuilt(ad)
    const roomCount = leboncoinService.digForRoomCount(ad)
    const hasFurniture = leboncoinService.digForHasFurniture(ad)
    const surface = leboncoinService.digForSurface(ad)
    const price = leboncoinService.digForPrice(ad)
    const [address, postalCode] = leboncoinService.digForAddress(ad)

    if (coordinates || address || postalCode) {
        getDistrict(coordinates, address, postalCode)
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

function getDistrict(coordinates, address, postalCode) {
    return coordinates ?
        Promise.resolve([addressService.getDistrictFromCoordinate(coordinates.lng, coordinates.lat)])
        : address ?
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
