const cleanup = require('helper/cleanup.helper')

function dataMapping(ad) {
    return {
        id: ad.id,
        title: cleanup.string(ad.title),
        description: cleanup.string(ad.description),
        price: cleanup.price(ad.price),
        renter: cleanup.string(ad.renter),
        rooms: cleanup.number(ad.rooms),
        furnished: ad.furnished,
        surface: cleanup.number(ad.surface),
        cityLabel: ad.cityLabel,
    }
}

module.exports = {
    dataMapping,
}
