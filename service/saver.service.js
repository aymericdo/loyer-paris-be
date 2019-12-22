const db = require('db')
const Rent = db.Rent
const log = require('helper/log.helper')

function rent({
    id,
    website,
    address,
    city,
    postalCode,
    longitude,
    latitude,
    hasFurniture,
    roomCount,
    yearBuilt,
    price,
    surface,
    maxPrice,
    isLegal,
    renter,
    createdAt,
    stations,
    priceExcludingCharges,
}) {
    if (id) {
        const rent = new Rent({
            id,
            website,
            createdAt,
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
            ...(yearBuilt != null && { yearBuilt }),
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

module.exports = {
    rent,
}
