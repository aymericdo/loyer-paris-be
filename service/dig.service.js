const stringToNumber = require('helper/string-to-number.helper')
const regexString = require('helper/regex.helper')
const cleanup = require('helper/cleanup.helper')
const addressService = require('service/address.service')

function digForCoordinates(ad) {
    return ad.coord ? {
        lng: ad.coord.lng,
        lat: ad.coord.lat,
    } : null
}

function digForAddress(ad) {
    const city = ad.cityLabel && ad.cityLabel.match(/[A-Za-z]+/g) && ad.cityLabel.match(/[A-Za-z]+/g)[0]
    const postalCode = ad.postalCode || ad.cityLabel
        && (_digForPostalCode(ad.cityLabel) || _digForPostalCode2(ad.cityLabel))
        || ad.description && (_digForPostalCode(ad.description) || _digForPostalCode2(ad.description))
    const address = ad.address || ad.description && _digForAddressInDescription(ad.description, { city, postalCode })
    return [address, postalCode, city]
}

function _digForAddressInDescription(description, { city, postalCode }) {
    const addressRe = new RegExp(regexString('address'))
    const addressesFromRegex = description.match(addressRe)
    if (city && cleanup.string(city) === 'paris' && addressesFromRegex) {
        const result = addressesFromRegex.flatMap(address => {
            return addressService.getAddressInParis(address.trim(), { postalCode })
        })
        return result && result.length ? cleanup.string(result[0].fields.l_adr) : addressesFromRegex[0].trim()
    } else {
        return addressesFromRegex && addressesFromRegex[0].trim()
    }
}

function _digForPostalCode(text) {
    const postalCodeRe = new RegExp(regexString('postalCode'))
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
}

function _digForPostalCode2(text) {
    const postalCode2Re = new RegExp(regexString('postalCode2'))
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? match.length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
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

function digForStations(ad) {
    return ad.stations
}

module.exports = {
    digForAddress,
    digForCoordinates,
    digForHasFurniture,
    digForPrice,
    digForRenter,
    digForRoomCount,
    digForSurface,
    digForYearBuilt,
    digForStations,
}
