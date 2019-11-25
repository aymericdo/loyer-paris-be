const cleanup = require('helper/cleanup.helper')

function apiMapping(ad) {
    const roomFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'rooms')
    const furnitureFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'furnished' && detail.value === '1')
    const surfaceFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'square')
    const yearFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'Année de construction')

    return {
        id: ad.list_id,
        title: cleanup.string(ad.subject),
        description: cleanup.string(ad.body),
        price: cleanup.price(ad.price[0]),
        rooms: roomFromDetail && roomFromDetail.value,
        furnished: !!furnitureFromDetail,
        surface: surfaceFromDetail && cleanup.number(surfaceFromDetail.value),
        yearBuilt: yearFromDetail && yearFromDetail.value,
        coord: {
            lng: ad.location.lng,
            lat: ad.location.lat,
        },
        cityLabel: ad.location.city,
        postalCode: ad.location.zipcode,
    }
}

function dataMapping(ad) {
    return {
        id: ad.id,
        cityLabel: cleanup.string(ad.cityLabel),
        description: cleanup.string(ad.body),
        furnished: ad.furnished ? ad.furnished === 'Meublé' ? true : ad.furnished === 'Non meublé' ? false : null : null,
        hasCharges: cleanup.string(ad.hasCharges) === 'oui' ? true : cleanup.string(ad.hasCharges) === 'non' ? false : null,
        price: cleanup.price(ad.price),
        renter: cleanup.string(ad.renter),
        rooms: cleanup.number(ad.rooms),
        surface: cleanup.number(ad.surface),
        title: cleanup.string(ad.subject),
    }
}

module.exports = {
    apiMapping,
    dataMapping,
}
