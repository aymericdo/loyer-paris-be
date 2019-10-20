const cleanup = require('helper/cleanup.helper')

function dataMapping(ad) {
    return {
        id: ad.id,
        cityLabel: cleanup.string(ad.cityLabel),
        description: cleanup.string(ad.description),
        furnished: ad.furnished ? ad.furnished === 'Meublé' ? true : false : null,
        price: +cleanup.price(ad.price),
        rooms: +cleanup.number(ad.rooms),
        surface: +cleanup.number(ad.surface),
        title: cleanup.string(ad.title),
    }
}

module.exports = {
    dataMapping,
}
