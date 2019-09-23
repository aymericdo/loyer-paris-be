const express = require('express');
const router = express.Router();
const request = require('request')
const xmlParser = require('xml2json');
const fs = require('fs');
const addressService = require('../service/address.service');
const yearBuiltService = require('../service/year-built.service');
const selogerService = require('./leboncoin.service');
const log = require('../helper/log.helper');

const rangeRents = JSON.parse(fs.readFileSync('encadrements.json', 'utf8'));

// routes
router.get('/', getById);

function getById(req, res, next) {
    log('getById')
    request({
        url: `https://api.leboncoin.fr/finder/classified/${req.query.id}`,
    }, (error, response, body) => {
        log('seloger fetched')
        console.log(body)
        const ad = JSON.parse(body)

        const coordinates = selogerService.digForCoordinates(ad)
        const yearBuilt = selogerService.digForYearBuilt(ad)
        const roomCount = selogerService.digForRoomCount(ad)
        const hasFurniture = selogerService.digForHasFurniture(ad)
        const surface = selogerService.digForSurface(ad)
        const price = selogerService.digForPrice(ad)

            const address = selogerService.digForAddress(ad)

        if (coordinates) {
            const district = addressService.getDistrictFromCoordinate(coordinates.lng, coordinates.lat)
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
                price: +price,
                surface: +surface,
                hasFurnitureDetected: hasFurniture,
                roomCountDetected: +roomCount,
                maxAuthorized: +rent.fields.max * +surface,
                isLegal: +price < +rent.fields.max * +surface,
                dateRange: rent.fields.epoque,
                max: rent.fields.max,
                min: rent.fields.min,
                hasFurniture: rent.fields.meuble_txt,
                roomCount: +rent.fields.piece,
                neighborhood: rent.fields.nom_quartier,
            })
        }
    })
}

module.exports = router;
