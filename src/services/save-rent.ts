import { Rent } from '@db/db'
import * as log from '@helpers/log'

interface SavedInfo {
    id: number
    address: string
    city: string
    hasFurniture: boolean
    isLegal: boolean
    latitude: number
    longitude: number
    maxPrice: number
    postalCode: string
    price: number
    priceExcludingCharges: number
    renter: string
    roomCount: number
    stations: string[]
    surface: number
    website: string
    yearBuilt: number[]
}

export const saveRent = ({
    id,
    address,
    city,
    hasFurniture,
    isLegal,
    latitude,
    longitude,
    maxPrice,
    postalCode,
    price,
    priceExcludingCharges,
    renter,
    roomCount,
    stations,
    surface,
    website,
    yearBuilt,
}: SavedInfo) => {
    if (id) {
        const rent = new Rent({
            id,
            website,
            ...(address != null && { address }),
            ...(city != null && { city }),
            ...(hasFurniture != null && { hasFurniture }),
            ...(isLegal != null && { isLegal }),
            ...(latitude != null && { latitude }),
            ...(longitude != null && { longitude }),
            ...(maxPrice != null && { maxPrice }),
            ...(postalCode != null && { postalCode }),
            ...(price != null && { price }),
            ...(priceExcludingCharges != null && { priceExcludingCharges }),
            ...(renter != null && { renter }),
            ...(roomCount != null && { roomCount }),
            ...(stations != null && stations.length && { stations }),
            ...(surface != null && { surface }),
            ...(yearBuilt != null && yearBuilt.length && { yearBuilt }),
        })
        log.info('rent saver start')
        rent.save()
            .then(() => {
                log.info('rent saved', 'green')
            })
            .catch(err => {
                if (err.code === 11000) {
                    log.info('⚠️  rent already saved', 'red')
                } else {
                    console.log(err)
                }
            })
    }
}