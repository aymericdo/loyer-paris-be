const numberString = require('./../helper/number-string.helper.js')
const regexString = require('./../helper/regex.helper')
const cleanup = require('./../helper/string-cleanup.helper')

function digForAddress(ad) {
    const address = ad.adresse || (ad.descriptif && _digForAddressInDescription(cleanup(ad.descriptif)))
    const postalCode = ad.cp || (ad.descriptif && _digForPostalCode(ad.descriptif.toLowerCase() || _digForNeighborhood(ad.descriptif.toLowerCase())))
    return address || postalCode ? `${address ? address : ''} ${postalCode ? postalCode : ''}` : null
}

function _digForAddressInDescription(description) {
    const addressRe = new RegExp(regexString('address'))
    return description.match(addressRe) && description.match(addressRe)[0]
}

function _digForPostalCode(description) {
    const postalCodeRe = new RegExp(regexString('postalCode'))
    return description.match(postalCodeRe) && description.match(postalCodeRe)[0]
}

function _digForNeighborhood(description) {
    const neighborhoodRe = new RegExp(regexString('neighborhood'))
    const match = description.match(neighborhoodRe) && description.match(neighborhoodRe)[0]
    return match ? match.length === 1 ? `7500${match}` : `750${match}` : null
}


function digForRoomCount(ad) {
    const roomFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Pièces')
    const roomFromTitle = ad.titre && cleanup(ad.titre).match(regexString('roomCount'))
    return ad.nbPieces || (roomFromDetail && roomFromDetail.valeur) || (roomFromTitle && (isNaN(roomFromTitle[1]) ? numberString(roomFromTitle[1]) : roomFromTitle[1]))
}

function digForYearBuilt(ad) {
    const yearFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Année de construction')
    return yearFromDetail && yearFromDetail.valeur
}

function digForHasFurniture(ad) {
    const furnitureFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Meublé')
    const furnitureFromDescription = ad.descriptif && cleanup(ad.descriptif).match(regexString('furnished'))
    return !!furnitureFromDetail || (furnitureFromDescription && furnitureFromDescription.length > 1) || null
}

function digForSurface(ad) {
    const surfaceFromDetail = ad.details && ad.details.detail.find(detail => detail.libelle === 'Surface')
    return ad.surfaceUnite === 'm²' ? (ad.surface || surfaceFromDetail.valeur.match(/\d+/g)[0]) : null
}

function digForPrice(ad) {
    return ad.prix
}

module.exports = {
    digForAddress,
    digForRoomCount,
    digForYearBuilt,
    digForHasFurniture,
    digForSurface,
    digForPrice,
}
