const cleanup = require('../helper/cleanup.helper')

function apiMapping(ad) {
    const roomFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Pièces')
    const surfaceFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Surface')
    const yearFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Année de construction')
   
    return {
        id: ad.id,
        title: cleanup.string(ad.titre),
        description: cleanup.string(ad.descriptif),
        address: ad.adresse,
        price: cleanup.price(ad.prix),
        rooms: ad.nbPieces || roomFromDetail && roomFromDetail.valeur,
        furnished: ad.furnished,
        surface: surfaceFromDetail && cleanup.number(surfaceFromDetail.valeur),
        yearBuilt: yearFromDetail && yearFromDetail.valeur,
        postalCode: ad.cp,
        cityLabel: ad.ville,
    }
}

module.exports = {
    apiMapping,
}
