const stringToNumber = require('helper/string-to-number.helper')
const regexString = require('helper/regex.helper')
const cleanup = require('helper/cleanup.helper')
const addressService = require('service/address.service')
const stationService = require('service/station.service')
const yearBuiltService = require('service/year-built.service')

const possibleBadRenter = ['seloger', 'loueragile', 'leboncoin', 'lefigaro', 'pap', 'orpi', 'logicimmo']

function main(ad) {
    const roomCount = digForRoomCount(ad)
    const hasFurniture = digForHasFurniture(ad)
    const surface = digForSurface(ad)
    const price = digForPrice(ad)
    const [address, postalCode, city] = digForAddress(ad)
    const coordinates = digForCoordinates(ad, address, city, postalCode)
    const yearBuilt = digForYearBuilt(ad, coordinates, postalCode)
    const renter = digForRenter(ad)
    const stations = digForStations(ad)
    const charges = digForCharges(ad)
    const hasCharges = digForHasCharges(ad)
    return {
        address,
        charges,
        city,
        coordinates,
        hasCharges,
        hasFurniture,
        postalCode,
        price,
        renter,
        roomCount,
        stations,
        surface,
        yearBuilt,
    }
}

function digForCoordinates(ad, address, city, postalCode) {
    const coordinatesFromAddress = addressService.getCoordinate(address, { city, postalCode })
    const coordinatesFromAd = ad.coord ? {
        lng: ad.coord.lng,
        lat: ad.coord.lat,
    } : null

    return coordinatesFromAd && coordinatesFromAd.lng.toString().length > 9 && coordinatesFromAd.lat.toString().length > 9 ?
        coordinatesFromAd : coordinatesFromAddress != null ?
            coordinatesFromAddress : coordinatesFromAd
}

function digForAddress(ad) {
    const postalCode = ad.postalCode || ad.cityLabel
        && (_digForPostalCode(ad.cityLabel) || _digForPostalCode2(ad.cityLabel))
        || ad.description && (_digForPostalCode(ad.description) || _digForPostalCode2(ad.description))
        || ad.title && (_digForPostalCode(ad.title) || _digForPostalCode2(ad.title))
    const city = ad.cityLabel && ad.cityLabel.match(/[A-Za-z]+/g) && cleanup.string(ad.cityLabel.match(/[A-Za-z]+/g)[0])
        || (postalCode && postalCode.toString().startsWith('75') ? 'paris' : null)
    const address = ad.address || (ad.description && _digForAddressInText(ad.description, { city, postalCode })) || (ad.title && _digForAddressInText(ad.title, { city, postalCode }))
    return [address, postalCode, city]
}

function _digForAddressInText(text, { city, postalCode }) {
    const addressRe = new RegExp(regexString('address'))
    const addressesFromRegex = text.match(addressRe)
    if (city && cleanup.string(city) === 'paris' && addressesFromRegex) {
        const result = addressesFromRegex.flatMap(address => {
            return addressService.getAddressInParis(address.trim().replace('bd ', 'boulevard '), { postalCode })
        }).filter(Boolean).sort((a, b) => a.score - b.score).map(address => address.item)
        return result && result.length ?
            cleanup.string(result[0].fields.l_adr).match(/^\d+/gi, "") ?
                cleanup.string(result[0].fields.l_adr) :
                cleanup.string(result[0].fields.l_adr).replace(/^\d+/gi, "").trim() :
            addressesFromRegex[0].trim()
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
    const roomsFromTitle = ad.title && ad.title.match(regexString('roomCount')) && ad.title.match(regexString('roomCount'))[0]
    const roomsFromDescription = ad.description && ad.description.match(regexString('roomCount')) && ad.description.match(regexString('roomCount'))[0]
    return (!!ad.rooms && ad.rooms) || stringToNumber(roomsFromTitle) || stringToNumber(roomsFromDescription)
}

function digForYearBuilt(ad, coordinates, postalCode) {
    const building = coordinates.lat && coordinates.lng &&
        yearBuiltService.getBuilding(coordinates.lat, coordinates.lng, postalCode)
    const yearBuiltFromBuilding = yearBuiltService.getYearBuiltFromBuilding(building)
    return ad.yearBuilt != null && !isNaN(ad.yearBuilt)
        ? [+ad.yearBuilt]
        : yearBuiltFromBuilding
}

function digForHasFurniture(ad) {
    const furnitureFromTitle = ad.title && ad.title.match(regexString('furnished'))
    const nonFurnitureFromTitle = ad.title && ad.title.match(regexString('nonFurnished'))
    const furnitureFromDescription = ad.description && ad.description.match(regexString('furnished'))
    const nonFurnitureFromDescription = ad.description && ad.description.match(regexString('nonFurnished'))
    return ad.furnished != null
        ? !!ad.furnished
        : (furnitureFromDescription && furnitureFromDescription.length > 0
            || furnitureFromTitle && furnitureFromTitle.length > 0) ? true :
            (nonFurnitureFromDescription && nonFurnitureFromDescription.length > 0
                || nonFurnitureFromTitle && nonFurnitureFromTitle.length > 0) ? false :
                null
}

function digForSurface(ad) {
    return ad.surface
        || ad.title && ad.title.match(regexString('surface')) && cleanup.number(ad.title.match(regexString('surface'))[0])
        || ad.description && ad.description.match(regexString('surface')) && cleanup.number(ad.description.match(regexString('surface'))[0])
}

function digForPrice(ad) {
    return ad.price
}

function digForRenter(ad) {
    return possibleBadRenter.includes(ad.renter) ? null : ad.renter
}

function digForStations(ad) {
    return ad.stations || ad.description && stationService.getStations(ad.description)
}

function digForCharges(ad) {
    return ad.charges || ad.description && ad.description.match(regexString('charges')) && cleanup.price(ad.description.match(regexString('charges'))[0])
}

function digForHasCharges(ad) {
    return ad.hasCharges
}

module.exports = {
    main,
}
