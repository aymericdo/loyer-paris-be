import express from 'express'
const router = express.Router()
const request = require('request')
const xmlParser = require('xml2json')
import * as log from './../helper/log.helper'
import * as digService from '../service/dig.service'
import * as selogerService from './seloger.service'
import { roundNumber } from '../helper/round-number.helper'
import * as cleanup from '../helper/cleanup.helper'
import { serializeRent } from '../service/serialize-rent.service'
import { rentFilter } from '../service/rent-filter.service'
import { saveRent } from '../service/save-rent.service'
import * as chargesService from '../service/charges.service'
import { errorEscape } from '../service/error-escape.service'
import { Ad } from 'src/service/interfaces'

router.get('/', getById)
function getById(req, res, next) {
    log.info(`-> ${req.baseUrl}/${req.query.id} getById`, 'blue')
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
            log.error('l\'api de seloger bug')
            res.status(403).json({ status: 403, msg: 'l\'api de seloger bug', error: 'api' })
        } else {
            log.info('seloger fetched')
            // Clean up {} values
            Object.keys(ad).forEach(key => {
                ad[key] = Object.entries(ad[key]).length === 0 && ad[key].constructor === Object ? null : ad[key]
            })

            digData(selogerService.apiMapping(ad))
                .then((data) => {
                    res.json(data)
                })
                .catch((err) => {
                    res.status(err.status).json(err)
                })
        }
    })
}

router.post('/data', getByData)
function getByData(req, res, next) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    digData(selogerService.dataMapping(req.body))
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.status(err.status).json(err)
        })
}

async function digData(ad: Ad) {
    const {
        address,
        charges,
        city,
        coordinates,
        hasCharges,
        hasFurniture,
        postalCode,
        price,
        renter,
        roomCount,
        stations,
        surface,
        yearBuilt,
    } = await digService.main(ad)

    errorEscape({
        address,
        city,
        postalCode,
        price,
        surface,
    })

    const adEncadrement = rentFilter({
        coordinates,
        hasFurniture,
        postalCode,
        roomCount,
        stations,
        yearBuilt,
    })

    if (adEncadrement) {
        const maxAuthorized = roundNumber(+adEncadrement.fields.max * surface)
        const priceExcludingCharges = chargesService.subCharges(price, charges, hasCharges)
        const isLegal = priceExcludingCharges <= maxAuthorized

        saveRent({
            id: ad.id,
            address,
            city,
            hasFurniture,
            isLegal,
            latitude: coordinates && coordinates.lat,
            longitude: coordinates && coordinates.lng,
            maxPrice: maxAuthorized,
            postalCode,
            price,
            priceExcludingCharges,
            renter,
            roomCount,
            stations,
            surface,
            website: 'seloger',
            yearBuilt,
        })

        return serializeRent({
            address,
            charges,
            hasCharges,
            hasFurniture,
            isLegal,
            maxAuthorized,
            postalCode,
            price,
            priceExcludingCharges,
            roomCount,
            surface,
            yearBuilt,
        }, adEncadrement)
    } else {
        log.error('no match found')
        throw { status: 403, msg: 'no match found', error: 'address' }
    }
}

module.exports = router
