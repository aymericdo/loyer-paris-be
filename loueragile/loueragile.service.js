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
    const address = _digForAddressInDescription(cleanup(ad.ad.description))
    const postalCode = ad.ad.postal_code || _digForPostalCode(ad.ad.description.toLowerCase()) || _digForNeighborhood(ad.ad.description.toLowerCase())
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
    const roomFromDetail = ad.ad.room
    const roomFromTitle = ad.ad.title && cleanup(ad.ad.title).match(regexString('roomCount'))
    return roomFromDetail || (roomFromTitle && (isNaN(roomFromTitle[1]) ? numberString(roomFromTitle[1]) : roomFromTitle[1]))
}

function digForYearBuilt(ad) {
    return ad.yearBuilt || null
}

function digForHasFurniture(ad) {
    const furnitureFromDetail = ad.ad.furnished
    const furnitureFromDescription = ad.ad.description && cleanup(ad.ad.description).match(regexString('furnished'))
    return !!furnitureFromDetail || (furnitureFromDescription && furnitureFromDescription.length > 1) || null
}

function digForSurface(ad) {
    return ad.ad.area || null
}

function digForPrice(ad) {
    return ad.ad.rent
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
