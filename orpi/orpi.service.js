const cleanup = require('helper/cleanup.helper')

function dataMapping(ad) {
    return {
        id: ad.id,
        charges: cleanup.price(ad.charges),
        cityLabel: cleanup.string(ad.cityLabel),
        coord: ad.coord,
        description: cleanup.string(ad.description),
        hasCharges: ad.hasCharges,
        furnished: ad.furnished,
        price: ad.price,
        postalCode: ad.postalCode,
        rooms: ad.rooms,
        surface: ad.surface,
        title: cleanup.string(ad.title),
        yearBuilt: !!ad.yearBuilt && ad.yearBuilt,
    }
}

module.exports = {
    dataMapping,
}
