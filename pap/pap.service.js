const cleanup = require('../helper/cleanup.helper')

function dataMapping(ad) {
    return {
        id: ad.id,
        title: cleanup.string(ad.title),
        description: cleanup.string(ad.description),
        price: +cleanup.price(ad.price),
        rooms: +cleanup.number(ad.rooms),
        furnished: ad.furnished ? ad.furnished === 'Meublé' ? true : false : null,
        surface: +cleanup.number(ad.surface),
        cityLabel: cleanup.string(ad.cityLabel),
    }
}

module.exports = {
    dataMapping,
}
