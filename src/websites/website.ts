import { subCharges } from '@helpers/charges'
import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { Ad } from '@interfaces/ad'
import { Mapping } from '@interfaces/mapping'
import { digForAddress, digForCharges, digForCoordinates, digForHasCharges, digForHasFurniture, digForPrice, digForRenter, digForRoomCount, digForStations, digForSurface, digForYearBuilt } from '@services/dig'
import { errorEscape, noMoreData } from '@services/error-escape'
import { rentFilter } from '@services/rent-filter'
import { saveRent } from '@services/save-rent'
import { serializeRent } from '@services/serialize-rent'
import { Response } from 'express'

export abstract class Website {
    website: string = null
    id: string = null
    body: Mapping = null

    constructor(props) {
        this.id = props.id
        this.body = props.body
    }

    public analyse(res: Response): void {
        this.digData()
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

    public async abstract mapping(): Promise<Ad>

    public async digData() {
        if (this.body && this.body.noMoreData) {
            noMoreData()
        }

        const ad: Ad = await this.mapping()

        const roomCount = digForRoomCount(ad)
        const hasFurniture = digForHasFurniture(ad)
        const surface = digForSurface(ad)
        const price = digForPrice(ad)
        const [address, postalCode, city] = digForAddress(ad)
        const coordinates = digForCoordinates(ad, address, city, postalCode)
        const yearBuilt = await digForYearBuilt(ad, coordinates)
        const renter = digForRenter(ad)
        const stations = digForStations(ad)
        const charges = digForCharges(ad)
        const hasCharges = digForHasCharges(ad)

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

            await saveRent({
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
