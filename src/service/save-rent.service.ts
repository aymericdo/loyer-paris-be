const db = require('db')
const Rent = db.Rent
import * as log from './../helper/log.helper'

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
}) => {
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
        log.info('Rent saver start')
        rent.save()
            .then(() => {
                log.info('Rent saved', 'green')
            })
            .catch(err => {
                if (err.code === 11000) {
                    log.info('⚠️  Rent already saved', 'red')
                } else {
                    console.log(err)
                }
            })
    }
}
