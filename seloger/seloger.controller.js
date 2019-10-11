const express = require('express')
const router = express.Router()
const request = require('request')
const xmlParser = require('xml2json')
const addressService = require('./../service/address.service')
const selogerService = require('./seloger.service')
const log = require('./../helper/log.helper')
const serializer = require('./../helper/serializer.helper')

// routes
router.get('/', getById)

function getById(req, res, next) {
    log(`-> ${req.baseUrl} getById`)
    request({
        url: `https://ws-seloger.svc.groupe-seloger.com/annonceDetail.xml?idAnnonce=${req.query.id}`,
    }, (error, response, body) => {
        log('seloger fetched')
        const ad = JSON.parse(xmlParser.toJson(body)).detailAnnonce

        // Clean up {} values
        Object.keys(ad).forEach(key => {
            ad[key] = Object.entries(ad[key]).length === 0 && ad[key].constructor === Object ? null : ad[key]
        })

        const address = selogerService.digForAddress(ad)
        const yearBuilt = selogerService.digForYearBuilt(ad)
        const roomCount = selogerService.digForRoomCount(ad)
        const hasFurniture = selogerService.digForHasFurniture(ad)
        const surface = selogerService.digForSurface(ad)
        const price = selogerService.digForPrice(ad)

        if (address) {
            addressService.getCoordinate(address)
                .then((info) => {
                    log('info address fetched')
                    const district = info && addressService.getDistrictFromCoordinate(info.geometry.lng, info.geometry.lat)

                    res.json(serializer({
                        id: ad.idAnnonce,
                        address,
                        district,
                        hasFurniture,
                        price,
                        roomCount,
                        surface,
                        yearBuilt,
                    }))
                })
        }
    })
}

module.exports = router
