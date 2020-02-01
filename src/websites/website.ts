import { Response } from 'express'
import { Ad } from '@interfaces/ad'
import * as log from '@helpers/log'
import { serializeRent } from '@services/serialize-rent'
import { rentFilter } from '@services/rent-filter'
import { roundNumber } from '@helpers/round-number'
import { errorEscape } from '@services/error-escape'
import { saveRent } from '@services/save-rent'
import { subCharges } from '@services/charges'
import { main } from '@services/dig'

export abstract class Website {
    website = null
    body = null

    constructor(props) {
        this.body = props.body
    }

    public analyse(res: Response): void {
        this.digData(this.dataMapping(this.body))
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

    public abstract dataMapping(ad): Ad

    public async digData(ad: Ad) {
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
        } = await main(ad)

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
            const priceExcludingCharges = subCharges(price, charges, hasCharges)
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
                website: this.website,
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
}
