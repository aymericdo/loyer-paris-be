import express, { Request, Response, NextFunction } from 'express'
import * as papService from './pap.service'
import * as log from '@helpers/log'
import * as digService from '@services/dig'
import { roundNumber } from '@helpers/round-number'
import { serializeRent } from '@services/serialize-rent'
import { rentFilter } from '@services/rent-filter'
import { saveRent } from '@services/save-rent'
import * as chargesService from '@services/charges'
import { errorEscape } from '@services/error-escape'
import { Ad } from '@interfaces/ad'
const router = express.Router()

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    digData(papService.dataMapping(req.body))
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            console.log(err)
            if (err.status) {
                res.status(err.status).json(err)
            } else {
                log.error('Error 500')
                res.status(500).json(err)
            }
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
            website: 'pap',
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
