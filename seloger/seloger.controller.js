const express = require('express');
const router = express.Router();
const request = require('request')
const xmlParser = require('xml2json');
const fs = require('fs');
const inside = require('point-in-polygon');
const addressService = require('./../service/address.service');
const log = require('./../helper/log.helper');

const parisDistricts = JSON.parse(fs.readFileSync('quartier_paris.json', 'utf8'));
const encadrements = JSON.parse(fs.readFileSync('encadrements.json', 'utf8'));

// routes
router.get('/', getById);

function getById(req, res, next) {
    log('getById')
    request({
        url: `https://ws-seloger.svc.groupe-seloger.com/annonceDetail.xml?idAnnonce=${req.query.id}`,
    }, (error, response, body) => {
        log('seloger fetched')
        const ad = JSON.parse(xmlParser.toJson(body)).detailAnnonce

        addressService.getCoordinate(ad.adresse)
            .then((info) => {
                log('info address fetched')
                const district = parisDistricts.find(district => inside([info.geometry.lng, info.geometry.lat], district.fields.geom.coordinates[0]))
                const yearBuilt = ad.details.detail.find(detail => detail.libelle === "Année de construction").valeur
                const roomCount = +ad.nbPieces
                const rent = encadrements.filter((encadrement) => {
                    const yearBuiltRange = encadrement.fields.epoque
                        .split(/[\s-]+/)
                        .map(year => isNaN(year) ? year.toLowerCase() : +year)

                    let isInRange = (typeof yearBuiltRange[0] === 'number') ?
                        yearBuiltRange[0] < yearBuilt && yearBuiltRange[1] > yearBuilt
                    : (yearBuiltRange[0] === 'avant') ?
                        yearBuilt < yearBuiltRange[1]
                    : (yearBuiltRange[0] === 'apres') ?
                        yearBuilt > yearBuiltRange[1]
                    :
                        false
                            
                    return encadrement.fields.id_quartier === district.fields.c_qu 
                        && isInRange
                        && encadrement.fields.piece === roomCount
                })
                // res.json(ad)
                // res.json(district)
                console.log(rent.length)
                res.json(rent)
            })
    })
}

module.exports = router;
