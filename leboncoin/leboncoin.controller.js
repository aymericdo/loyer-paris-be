const express = require('express')
const router = express.Router()
const fakeUa = require('fake-useragent')
const leboncoinService = require('./leboncoin.service')
const digService = require('service/dig.service')
const log = require('helper/log.helper')
const serializer = require('service/serializer.service')
const rentFilter = require('service/rent-filter.service')
const saverService = require('service/saver.service')
const tr = require('tor-request')

tr.TorControlPort.password = process.env.TOR_PASSWORD

let requestsCount = 0

// routes
router.get('/', getById)
router.post('/data', getByData)

function getById(req, res, next) {
    log(`-> ${req.baseUrl} getById`, 'blue')
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
                digData(leboncoinService.apiMapping(ad),
                    (data) => {
                        res.json(data)
                    }, (err) => {
                        res.status(err.status).json({
                            error: err.error,
                        })
                    })
            } else {
                res.status(403).json({
                    error: 'no body found',
                })
            }
        })
    })

    requestsCount += 1
}

function getByData(req, res, next) {
    log(`-> ${req.baseUrl} getByData`, 'blue')
    digData(leboncoinService.dataMapping(req.body),
        (data) => {
            res.json(data)
        }, (err) => {
            res.status(err.status).json(err)
        })
}

function digData(ad, onSuccess, onError) {
    const coordinates = digService.digForCoordinates(ad)
    const city = digService.digForCity(ad)
    const yearBuilt = digService.digForYearBuilt(ad)
    const roomCount = digService.digForRoomCount(ad)
    const hasFurniture = digService.digForHasFurniture(ad)
    const surface = digService.digForSurface(ad)
    const price = digService.digForPrice(ad)
    const [address, postalCode] = digService.digForAddress(ad)
    const renter = digService.digForRenter(ad)

    if (coordinates || address || postalCode) {
        if (city && !!city.length && city.toLowerCase() !== 'paris') {
            log('error -> not in Paris')
            onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
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
                        website: 'leboncoin',
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
