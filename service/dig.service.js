const stringToNumber = require('helper/string-to-number.helper')
const regexString = require('helper/regex.helper')

function digForCoordinates(ad) {
    return ad.coord ? {
        lng: ad.coord.lng,
        lat: ad.coord.lat,
    } : null
}

function digForCity(ad) {
    return ad.cityLabel && ad.cityLabel.match(/[A-Za-z]+/g) && ad.cityLabel.match(/[A-Za-z]+/g)[0]
}

function digForAddress(ad) {
    const address = ad.adresse || ad.description && _digForAddressInDescription(ad.description)
    const postalCode = ad.postalCode || ad.cityLabel && (_digForPostalCode(ad.cityLabel) || _digForNeighborhood(ad.cityLabel)) || ad.description && (_digForPostalCode(ad.description) || _digForNeighborhood(ad.description))
    return [address, postalCode]
}

function _digForAddressInDescription(description) {
    const addressRe = new RegExp(regexString('address'))
    return description.match(addressRe) && description.match(addressRe)[0]
}

function _digForPostalCode(text) {
    const postalCodeRe = new RegExp(regexString('postalCode'))
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0]
}

function _digForNeighborhood(text) {
    const neighborhoodRe = new RegExp(regexString('neighborhood'))
    const match = text.match(neighborhoodRe) && text.match(neighborhoodRe)[0]
    return match ? match.length === 1 ? `7500${match}` : `750${match}` : null
}

function digForRoomCount(ad) {
    const roomsFromTitle = ad.title && ad.title.match(regexString('roomCount')) && ad.title.match(regexString('roomCount'))[1]
    const roomsFromDescription = ad.description && ad.description.match(regexString('roomCount')) && ad.description.match(regexString('roomCount'))[1]
    return (!!ad.rooms && ad.rooms) || stringToNumber(roomsFromTitle) || stringToNumber(roomsFromDescription)
}

function digForYearBuilt(ad) {
    return ad.yearBuilt
}

function digForHasFurniture(ad) {
    const furnitureFromTitle = ad.title && ad.title.match(regexString('furnished'))
    const furnitureFromDescription = ad.description && ad.description.match(regexString('furnished'))
    return ad.furnished !== null && !!ad.furnished || (furnitureFromDescription && furnitureFromDescription.length > 0) || (furnitureFromTitle && furnitureFromTitle.length > 0) || null
}

function digForSurface(ad) {
    return ad.surface
}

function digForPrice(ad) {
    return ad.price
}

function digForRenter(ad) {
    return ad.renter
}

module.exports = {
    digForAddress,
    digForCity,
    digForCoordinates,
    digForHasFurniture,
    digForPrice,
    digForRenter,
    digForRoomCount,
    digForSurface,
    digForYearBuilt,
}
