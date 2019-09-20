const numberString = require('./../helper/number-string.helper.js');

function digForAddress(ad) {
    return ad.adresse
}

function digForRoomCount(ad) {
    const roomFromDetail = ad.details.detail.find(detail => detail.libelle === "Pièces")
    const roomFromTitle = ad.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match('([0-9]*|un|deux|trois|quatre|cinq|six|sept)? ?((piece))')
    return ad.nbPieces || (roomFromDetail && roomFromDetail.valeur) || (roomFromTitle || (isNaN(roomFromTitle[1]) ? numberString(roomFromTitle[1]) : roomFromTitle[1]))
}

function digForYearBuilt(ad) {
    const yearFromDetail = ad.details.detail.find(detail => detail.libelle === "Année de construction")
    return yearFromDetail && yearFromDetail.valeur
}

function digForHasFurniture(ad) {
    const furnitureFromDescription = ad.descriptif.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match('meuble')
    return false
}

module.exports = {
    digForAddress,
    digForRoomCount,
    digForYearBuilt,
    digForHasFurniture,
};
