const numberString = require('../helper/number-string.helper.js');
const regexString = require('./../helper/regex.helper');

function digForCoordinates(ad) {
    const lat = ad.ad.lat;
    const long = ad.ad.lng;
    return {"lng": long, "lat": lat}
}

function digForAddress(ad) {
    const address = _digForAddressInDescription(ad.ad.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    const postalCode = ad.ad.postal_code || _digForPostalCode(ad.ad.description.toLowerCase()) || _digForNeighborhood(ad.ad.description.toLowerCase())
    return address || postalCode ? `${address} ${postalCode}` : null
}

function _digForAddressInDescription(description) {
    const addressRe = new RegExp(regexString("address"));
    return description.match(addressRe) && description.match(addressRe)[0];
}

function _digForPostalCode(description) {
    const postalCodeRe = new RegExp(regexString("postalCode"));
    return description.match(postalCodeRe) && description.match(postalCodeRe)[0];
}

function _digForNeighborhood(description) {
    const neighborhoodRe = new RegExp(regexString("neighborhood"));
    const match = description.match(neighborhoodRe) && description.match(neighborhoodRe)[0];
    return match ? match.length === 1 ? `7500${match}` : `750${match}` : null;
}


function digForRoomCount(ad) {
    const roomFromDetail = ad.ad.room
    const roomFromTitle = ad.ad.title && ad.ad.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(regexString("roomCount"))
    return roomFromDetail || (roomFromTitle || (isNaN(roomFromTitle[1]) ? numberString(roomFromTitle[1]) : roomFromTitle[1]))
}

function digForYearBuilt(ad) {
    return ad.yearBuilt || null
}

function digForHasFurniture(ad) {
    const furnitureFromDetail = ad.ad.furnished
    const furnitureFromDescription = ad.ad.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(regexString("furnished"))
    return !!furnitureFromDetail || furnitureFromDescription.length > 1 || null
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
};
