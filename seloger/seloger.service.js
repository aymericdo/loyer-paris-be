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
    return +ad.nbPieces
}

function digForYearBuilt(ad) {
    return ad.details.detail.find(detail => detail.libelle === "Année de construction") ? ad.details.detail.find(detail => detail.libelle === "Année de construction").valeur : 0
}

function digForHasFurniture(ad) {
    return false
}

module.exports = {
    digForAddress,
    digForRoomCount,
    digForYearBuilt,
    digForHasFurniture,
};
