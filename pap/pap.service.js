const numberString = require('../helper/number-string.helper.js')
const regexString = require('./../helper/regex.helper')
const cleanup = require('./../helper/string-cleanup.helper')

function digForAddress(ad) {
    const address = _digForAddressInDescription(cleanup(ad.description))
    const postalCode = ad.location.zipcode || ad.description && (_digForPostalCode(ad.description.toLowerCase()) || _digForNeighborhood(ad.description.toLowerCase()))
    return [address, postalCode]
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
    const roomFromTitle = ad.title && cleanup(ad.title).match(regexString('roomCount'))
    return (roomFromDetail && roomFromDetail.value) || (roomFromTitle && (isNaN(roomFromTitle[1]) ? numberString(roomFromTitle[1]) : roomFromTitle[1]))
}

function digForYearBuilt(ad) {
    const yearFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'Année de construction')
    return yearFromDetail && yearFromDetail.valeur
}

function digForHasFurniture(ad) {
    const furnitureFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'furnished' && detail.value === '1')
    const furnitureFromDescription = ad.description && cleanup(ad.description).match(regexString('furnished'))
    return !!furnitureFromDetail || (furnitureFromDescription && furnitureFromDescription.length > 0) || null
}

function digForSurface(ad) {
    const surfaceFromDetail = ad.attributes && ad.attributes.find(detail => detail.key === 'square')
    return surfaceFromDetail && surfaceFromDetail.value
}

function digForPrice(ad) {
    return ad.price
}

module.exports = {
    digForAddress,
    digForRoomCount,
    digForYearBuilt,
    digForHasFurniture,
    digForSurface,
    digForPrice,
}
