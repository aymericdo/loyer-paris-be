const numberString = require('../helper/number-string.helper.js');
const regexString = require('./../helper/regex.helper');

function digForCoordinates(ad) {
    const lat = ad.location.lat;
    const long = ad.location.lng;
    return {"lng": long, "lat": lat}
}

function digForAddress(ad) {
    const address = _digForAddressInDescription(ad.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    const postalCode = ad.location.zipcode || _digForPostalCode(ad.body.toLowerCase()) || _digForNeighborhood(ad.body.toLowerCase())
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
    const roomFromDetail = ad.attributes.find(detail => detail.key === "rooms")
    const roomFromTitle = ad.subject && ad.subject.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(regexString("roomCount"))
    return (roomFromDetail && roomFromDetail.value) || (roomFromTitle || (isNaN(roomFromTitle[1]) ? numberString(roomFromTitle[1]) : roomFromTitle[1]))
}

function digForYearBuilt(ad) {
    const yearFromDetail = ad.attributes.find(detail => detail.key === "Année de construction")
    return yearFromDetail && yearFromDetail.valeur
}

function digForHasFurniture(ad) {
    const furnitureFromDetail = ad.attributes.find(detail => detail.key_label === "Meublé / Non meublé")
    const furnitureFromDescription = ad.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(regexString("furnished"))
    return !!furnitureFromDetail || furnitureFromDescription.length > 1 || null
}

function digForSurface(ad) {
    const surfaceFromDetail = ad.attributes.find(detail => detail.key === "square")
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
};
