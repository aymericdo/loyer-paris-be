const express = require('express')
const router = express.Router()
const request = require('request')
const xmlParser = require('xml2json')
const selogerService = require('./seloger.service')
const digService = require('./../service/dig.service')
const log = require('./../helper/log.helper')
const cleanup = require('../helper/cleanup.helper')
const serializer = require('./../service/serializer.service')
const rentFilter = require('./../service/rent-filter.service')
const saverService = require('./../service/saver.service')

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
        url: `https://ws-seloger.svc.groupe-seloger.com/annonceDetail.xml?idAnnonce=${req.query.id}`,
    }, (error, response, body) => {
        log('seloger fetched')
        const ad = JSON.parse(xmlParser.toJson(body)).detailAnnonce

        // Clean up {} values
        Object.keys(ad).forEach(key => {
            ad[key] = Object.entries(ad[key]).length === 0 && ad[key].constructor === Object ? null : ad[key]
        })

        const cleanAd = selogerService.apiMapping(ad)

        const [address, postalCode] = digService.digForAddress(cleanAd)
        const yearBuilt = digService.digForYearBuilt(cleanAd)
        const city = digService.digForCity(cleanAd)
        const roomCount = digService.digForRoomCount(cleanAd)
        const hasFurniture = digService.digForHasFurniture(cleanAd)
        const surface = digService.digForSurface(cleanAd)
        const price = digService.digForPrice(cleanAd)

        if (address || postalCode) {
            if (city && !!city.length && city.toLowerCase() !== 'paris') {
                log('error -> not in Paris')
                res.status(400).json({ msg: 'not in Paris bro', error: 'paris' })
            } else {
                rentFilter({
                    address,
                    hasFurniture,
                    postalCode,
                    roomCount,
                    yearBuilt,
                }).then(({ match, coord }) => {
                    if (match) {
                        const serializedData = serializer({
                            id: cleanAd.id,
                            address,
                            postalCode,
                            hasFurniture,
                            price,
                            roomCount,
                            surface,
                            yearBuilt,
                        }, match)

                        saverService.rent({
                            id: serializedData.id,
                            website: 'seloger',
                            address,
                            postalCode,
                            longitude: coord && coord.lng,
                            latitude: coord && coord.lat,
                            hasFurniture,
                            roomCount,
                            yearBuilt,
                            price,
                            surface,
                            maxPrice: serializedData.computedInfo.maxAuthorized,
                            isLegal: serializedData.isLegal,
                            // renter,
                        })

                        res.json(serializedData)
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
