const cleanup = require('helper/cleanup.helper')
const particulierToken = require('helper/particulier.helper')

function dataMapping(ad) {
    return {
        id: ad.id,
        cityLabel: cleanup.string(ad.cityLabel),
        description: cleanup.string(ad.description),
        price: cleanup.price(ad.price),
        rooms: cleanup.number(ad.rooms),
        renter: particulierToken(),
        surface: cleanup.number(ad.surface),
        title: cleanup.string(ad.title),
        stations: ad.stations.map(station => cleanup.string(station)),
    }
}

module.exports = {
    dataMapping,
}
