const express = require('express');
const router = express.Router();
const request = require('request')
const xmlParser = require('xml2json');
const fs = require('fs');
const addressService = require('../service/address.service');
const yearBuiltService = require('../service/year-built.service');
const louerAgileService = require('./loueragile.service');
const log = require('../helper/log.helper');

const rangeRents = JSON.parse(fs.readFileSync('encadrements.json', 'utf8'));

// routes
router.get('/', getById);

function getById(req, res, next) {
    log('getById')
    request({
        url: `https://www.loueragile.fr/apiv2/alert/${process.env.LOUER_AGILE_API_KEY}/ad/${req.query.id}`,
    }, (error, response, body) => {
        log('loueragile fetched')
        const ad = JSON.parse(body)

        const coordinates = louerAgileService.digForCoordinates(ad)
        const yearBuilt = louerAgileService.digForYearBuilt(ad)
        const roomCount = louerAgileService.digForRoomCount(ad)
        const hasFurniture = louerAgileService.digForHasFurniture(ad)
        const surface = louerAgileService.digForSurface(ad)
        const price = louerAgileService.digForPrice(ad)
        const address = louerAgileService.digForAddress(ad)

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
                detectedInfo: {
                    address,
                    hasFurniture,
                    price: +(+price).toFixed(2),
                    roomCount: +roomCount,
                    surface: +surface,
                    yearBuilt: +yearBuilt,
                },
                computedInfo: {
                    dateRange: rent.fields.epoque,
                    hasFurniture: !!rent.fields.meuble_txt.match('^meubl'),
                    max: rent.fields.max,
                    maxAuthorized: +(+rent.fields.max * +surface).toFixed(2),
                    min: rent.fields.min,
                    neighborhood: rent.fields.nom_quartier,
                    roomCount: +rent.fields.piece,
                },
                isLegal: +price < +rent.fields.max * +surface,
            })
        }
    })
}

module.exports = router;
