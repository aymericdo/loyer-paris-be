const express = require('express');
const router = express.Router();
const request = require('request')
const xmlParser = require('xml2json');
const fs = require('fs');
const addressService = require('./../service/address.service');
const yearBuiltService = require('./../service/year-built.service');
const selogerService = require('./seloger.service');
const log = require('./../helper/log.helper');

const rangeRents = JSON.parse(fs.readFileSync('encadrements.json', 'utf8'));

// routes
router.get('/', getById);

function getById(req, res, next) {
    log('getById')
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
                    const district = addressService.getDistrictFromCoordinate(info.geometry.lng, info.geometry.lat)
                    const yearRange = yearBuiltService.getYearRange(rangeRents, yearBuilt)

                    const rentList = rangeRents.filter((rangeRent) => {
                        return rangeRent.fields.id_quartier === district.fields.c_qu
                            && (yearRange ? rangeRent.fields.epoque === yearRange : true)
                            && (roomCount ? rangeRent.fields.piece === +roomCount : true)
                            && (hasFurniture !== null ? hasFurniture ? rangeRent.fields.meuble_txt.match('^meubl') : rangeRent.fields.meuble_txt.match('^non meubl') : true)
                    })

                    const rent = rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current)

                    log('filter done, sending data')
                    res.json({
                        id: ad.idAnnonce,
                        address,
                        yearBuilt: +yearBuilt,
                        price: +(+price).toFixed(2),
                        surface: +surface,
                        hasFurnitureDetected: hasFurniture,
                        roomCountDetected: +roomCount,
                        maxAuthorized: +(+rent.fields.max * +surface).toFixed(2),
                        isLegal: +price < +rent.fields.max * +surface,
                        dateRange: rent.fields.epoque,
                        max: rent.fields.max,
                        min: rent.fields.min,
                        hasFurniture: rent.fields.meuble_txt,
                        roomCount: +rent.fields.piece,
                        neighborhood: rent.fields.nom_quartier,
                    })
                })
        }
    })
}

module.exports = router;
