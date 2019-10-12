const cleanup = require('../helper/cleanup.helper')

function apiMapping(ad) {
    return {
        id: ad.ad.id,
        title: cleanup.string(ad.ad.title),
        description: cleanup.string(ad.ad.description),
        price: ad.ad.rent,
        rooms: ad.ad.room,
        furnished: ad.ad.furnished,
        surface: ad.ad.area,
        yearBuilt: ad.yearBuilt,
        postalCode: ad.ad.postal_code,
        coord: {
            lng: ad.ad.lng,
            lat: ad.ad.lat,
        },
        cityLabel: ad.ad.city,
    }
}

module.exports = {
    apiMapping,
}
