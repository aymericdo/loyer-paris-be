const db = require('db')
const Rent = db.Rent
const log = require('helper/log.helper')

function rent({
    id,
    website,
    address,
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
}) {
    const rent = new Rent({
        id,
        website,
        address,
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
    })
    log('Rent saver start')
    rent.save()
        .then(() => {
            log('Rent saved', 'green')
        })
        .catch(err => {
            if (err.code === 11000) {
                log('⚠️  Rent already saved', 'red')
            } else {
                console.log(err)
            }
        })
}

module.exports = {
    rent,
}
