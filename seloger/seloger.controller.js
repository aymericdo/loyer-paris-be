const express = require('express')
const router = express.Router()
const request = require('request')
const xmlParser = require('xml2json')
const selogerService = require('./seloger.service')
const digService = require('service/dig.service')
const log = require('helper/log.helper')
const roundNumber = require('helper/round-number.helper')
const cleanup = require('helper/cleanup.helper')
const serializer = require('service/serializer.service')
const rentFilter = require('service/rent-filter.service')
const saverService = require('service/saver.service')

router.get('/', getById)
function getById(req, res, next) {
    log(`-> ${req.baseUrl} getById`, 'blue')
    if (!cleanup.number(req.query.id)) {
        res.status(403).json({
            msg: 'no address found', error: 'address',
        })
    }
    request({
        url: `https://ws-seloger.svc.groupe-seloger.com/annonceDetail.xml?idAnnonce=${req.query.id}`,
    }, (error, response, body) => {
        const ad = JSON.parse(xmlParser.toJson(body)).detailAnnonce

        if (!ad || !!error) {
            log('error -> l\'api de seloger bug')
            res.status(403).json({ status: 403, msg: 'l\'api de seloger bug', error: 'api' })
        } else {
            log('seloger fetched')
            // Clean up {} values
            Object.keys(ad).forEach(key => {
                ad[key] = Object.entries(ad[key]).length === 0 && ad[key].constructor === Object ? null : ad[key]
            })

            digData(selogerService.apiMapping(ad),
                (data) => {
                    res.json(data)
                }, (err) => {
                    res.status(err.status).json(err)
                })
        }
    })
}

router.post('/data', getByData)
function getByData(req, res, next) {
    log(`-> ${req.baseUrl} getByData`, 'blue')
    digData(selogerService.dataMapping(req.body),
        (data) => {
            res.json(data)
        }, (err) => {
            res.status(err.status).json(err)
        })
}

function digData(ad, onSuccess, onError) {
    const [address, postalCode, city] = digService.digForAddress(ad)
    const yearBuilt = digService.digForYearBuilt(ad)
    const roomCount = digService.digForRoomCount(ad)
    const hasFurniture = digService.digForHasFurniture(ad)
    const surface = digService.digForSurface(ad)
    const price = digService.digForPrice(ad)
    const renter = digService.digForRenter(ad)
    const stations = digService.digForStations(ad)

    if (!price || !surface) {
        if (address || postalCode) {
            if (city && !!city.length && city.toLowerCase() !== 'paris') {
                log('error -> not in Paris')
                onError({ status: 400, msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    address,
                    city,
                    hasFurniture,
                    postalCode,
                    roomCount,
                    stations,
                    yearBuilt,
                }).then(({ match, coord }) => {
                    if (match) {
                        const maxAuthorized = roundNumber(+match.fields.max * surface)
                        const isLegal = price <= maxAuthorized

                        saverService.rent({
                            id: ad.id,
                            address,
                            city,
                            hasFurniture,
                            isLegal,
                            latitude: coord && coord.lat,
                            longitude: coord && coord.lng,
                            maxPrice: maxAuthorized,
                            postalCode,
                            price,
                            renter,
                            roomCount,
                            stations,
                            surface,
                            website: 'seloger',
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
    } else {
        log('error -> minimal information not found')
        onError({ status: 403, msg: 'minimal information not found', error: 'minimal' })
    }
}

module.exports = router
