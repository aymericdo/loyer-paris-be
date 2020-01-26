const cleanup = require('helper/cleanup.helper')

function apiMapping(ad) {
    return {
        id: ad.ad.id,
        cityLabel: ad.ad.city,
        coord: {
            lng: ad.ad.lng,
            lat: ad.ad.lat,
        },
        description: cleanup.string(ad.ad.description),
        furnished: ad.ad.furnished,
        postalCode: ad.ad.postal_code,
        price: ad.ad.rent,
        renter: ad.ad.owner_type === 'Agence' ? cleanup.string(ad.ad.source) : 'Particulier',
        rooms: ad.ad.room,
        surface: ad.ad.area,
        title: cleanup.string(ad.ad.title),
        yearBuilt: ad.yearBuilt,
        stations: ad.ad.stops.map(stop => cleanup.string(stop.name))
    }
}

module.exports = {
    apiMapping,
}
