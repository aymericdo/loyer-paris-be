const numberString = require('../helper/number-string.helper.js')
const regexString = require('./../helper/regex.helper')
const cleanup = require('./../helper/string-cleanup.helper')

function digForCoordinates(ad) {
    return ad.location ? {
        lng: ad.location.lng,
        lat: ad.location.lat,
    } : null
}

function digForAddress(ad) {
    const address = _digForAddressInDescription(cleanup(ad.body))
    const postalCode = ad.location.zipcode || ad.body && (_digForPostalCode(ad.body.toLowerCase()) || _digForNeighborhood(ad.body.toLowerCase()))
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
    const roomFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'rooms')
    const roomFromTitle = ad.subject && cleanup(ad.subject).match(regexString('roomCount'))
    return (roomFromDetail && roomFromDetail.value) || (roomFromTitle && (isNaN(roomFromTitle[1]) ? numberString(roomFromTitle[1]) : roomFromTitle[1]))
}

function digForYearBuilt(ad) {
    const yearFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'Année de construction')
    return yearFromDetail && yearFromDetail.valeur
}

function digForHasFurniture(ad) {
    const furnitureFromDetail = ad.attributes && ad.attributes.find(detail => detail.key_label === 'Meublé / Non meublé' && detail.value_label === 'Meublé')
    const furnitureFromDescription = ad.body && cleanup(ad.body).match(regexString('furnished'))
    return !!furnitureFromDetail || (furnitureFromDescription && furnitureFromDescription.length > 1) || null
}

function digForSurface(ad) {
    const surfaceFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'square')
    return surfaceFromDetail && surfaceFromDetail.value
}

function digForPrice(ad) {
    return ad.price
}

module.exports = {
    digForCoordinates,
    digForAddress,
    digForRoomCount,
    digForYearBuilt,
    digForHasFurniture,
    digForSurface,
    digForPrice,
}
