function digForAddress(ad) {
    return ad.adresse
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
