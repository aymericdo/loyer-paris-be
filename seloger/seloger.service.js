const cleanup = require('helper/cleanup.helper')

function apiMapping(ad) {
    const roomFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Pièces')
    const surfaceFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Surface')
    const yearFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Année de construction')

    return {
        id: ad.idAnnonce,
        address: cleanup.string(ad.adresse),
        cityLabel: ad.ville,
        description: cleanup.string(ad.descriptif),
        furnished: ad.furnished,
        neighborhood: ad.permaLien.split('/').splice(-2)[0],
        postalCode: ad.cp,
        price: cleanup.price(ad.prix),
        renter: ad.contact && cleanup.string(ad.contact.nom),
        rooms: ad.nbPieces || roomFromDetail && roomFromDetail.valeur,
        surface: surfaceFromDetail && cleanup.number(surfaceFromDetail.valeur),
        title: cleanup.string(ad.titre),
        yearBuilt: yearFromDetail && yearFromDetail.valeur,
    }
}

module.exports = {
    apiMapping,
}
