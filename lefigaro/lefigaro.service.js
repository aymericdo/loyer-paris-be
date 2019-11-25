const cleanup = require('helper/cleanup.helper')

function dataMapping(ad) {
    return {
        id: ad.id,
        charges: cleanup.price(ad.charges),
        cityLabel: ad.cityLabel,
        description: cleanup.string(ad.description),
        furnished: ad.furnished,
        hasCharges: ad.hasCharges,
        price: cleanup.price(ad.price),
        renter: cleanup.string(ad.renter),
        rooms: cleanup.number(ad.rooms),
        surface: cleanup.number(ad.surface),
        title: cleanup.string(ad.title),
    }
}

module.exports = {
    dataMapping,
}
