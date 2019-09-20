const numberString = require('./../helper/number-string.helper.js');

function digForAddress(ad) {
    const address = ad.adresse || _digForAddressInDescription(ad.descriptif)
    const postalCode = ad.cp || _digForPostalCode(ad.descriptif) || _digForNeighborhood(ad.descriptif)
    return address || postalCode ? `${address} ${postalCode}` : null
}

function _digForAddressInDescription(descriptif) {
    const addressRe = new RegExp("([0-9]*)? ?((rue|avenue|passage|boulevard|faubourg|allée|allee|quai|place|jardin) [a-zA-Zô'\ ]*)");
    return descriptif.match(addressRe) && ad.descriptif.match(addressRe)[0];
}

function _digForPostalCode(descriptif) {
    const postalCodeRe = new RegExp("\b75[0-9]{3}\b");
    return descriptif.match(postalCodeRe) && ad.descriptif.match(postalCodeRe)[0];
}

function _digForNeighborhood(descriptif) {
    const neighborhoodRe = new RegExp("(?<=paris )[0-9]{1,2}");
    const match = descriptif.match(neighborhoodRe) && ad.descriptif.match(neighborhoodRe)[0];
    return match ? match.length === 1 ? `7500${match}` : `750${match}` : null;
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
