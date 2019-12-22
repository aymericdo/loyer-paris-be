const cleanup = require('helper/cleanup.helper')
const particulierToken = require('helper/particulier.helper')

function dataMapping(ad) {
    return {
        id: ad.id,
        charges: cleanup.price(ad.charges),
        cityLabel: cleanup.string(ad.cityLabel),
        description: cleanup.string(ad.description),
        furnished: ad.furnished != null ? ad.furnished !== 'NC' ? true : false : null,
        hasCharges: ad.hasCharges,
        price: cleanup.price(ad.price),
        renter: ad.renter ? cleanup.string(ad.renter) : particulierToken(),
        rooms: cleanup.number(ad.rooms),
        surface: cleanup.number(ad.surface),
        title: cleanup.string(ad.title),
    }
}

module.exports = {
    dataMapping,
}
