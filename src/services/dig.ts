import * as cleanup from '@helpers/cleanup'
import { regexString } from '@helpers/regex'
import { stringToNumber } from '@helpers/string-to-number'
import { Ad } from '@interfaces/ad'
import { AddressInfo, Coordinate } from '@interfaces/shared'
import * as addressService from '@services/address'
import * as stationService from '@services/station'
import * as yearBuiltService from '@services/year-built'

const possibleBadRenter = ['seloger', 'loueragile', 'leboncoin', 'lefigaro', 'pap', 'orpi', 'logicimmo']

export function digForCoordinates(ad: Ad, address: string, city: string, postalCode: string): Coordinate {
    const coordinatesFromAddress = addressService.getCoordinate(address, { city, postalCode })
    const coordinatesFromAd = ad.coord && ad.coord.lng && ad.coord.lat ? {
        lng: ad.coord.lng,
        lat: ad.coord.lat,
    } : null

    return coordinatesFromAd && coordinatesFromAd.lng.toString().length > 9 && coordinatesFromAd.lat.toString().length > 9 ?
        coordinatesFromAd : coordinatesFromAddress != null ?
            coordinatesFromAddress : coordinatesFromAd
}

export function digForAddress(ad: Ad): string[] {
    const postalCode = ad.postalCode || ad.cityLabel
        && (_digForPostalCode(ad.cityLabel) || _digForPostalCode2(ad.cityLabel))
        || ad.description && (_digForPostalCode(ad.description) || _digForPostalCode2(ad.description))
        || ad.title && (_digForPostalCode(ad.title) || _digForPostalCode2(ad.title))
    const city = ad.cityLabel && ad.cityLabel.match(/[A-Za-z]+/g) && cleanup.string(ad.cityLabel.match(/[A-Za-z]+/g)[0])
        || (postalCode && postalCode.toString().startsWith('75') ? 'paris' : null)
    const address = ad.address || (ad.description && _digForAddressInText(ad.description, { city, postalCode })) || (ad.title && _digForAddressInText(ad.title, { city, postalCode }))
    return [address, postalCode, city]
}

function _digForAddressInText(text: string, { city, postalCode }: AddressInfo): string {
    const addressRe = new RegExp(regexString('address'))
    const addressesFromRegex = text.match(addressRe) as any
    if (city && cleanup.string(city) === 'paris' && addressesFromRegex) {
        const result = addressesFromRegex.flatMap(address => {
            return addressService.getAddressInParis(address.trim().replace('bd ', 'boulevard '), { postalCode })
        }).filter(Boolean).sort((a, b) => a.score - b.score).map(address => address.item)
        return result && result.length ?
            cleanup.string(addressesFromRegex[0].trim()).match(/^\d+/gi) ?
                cleanup.string(result[0].fields.l_adr) :
                cleanup.string(result[0].fields.l_adr).replace(/^\d+/gi, "").trim() :
            addressesFromRegex[0].trim()
    } else {
        return addressesFromRegex && addressesFromRegex[0].trim()
    }
}

function _digForPostalCode(text: string): string {
    const postalCodeRe = new RegExp(regexString('postalCode'))
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
}

function _digForPostalCode2(text: string): string {
    const postalCode2Re = new RegExp(regexString('postalCode2'))
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? match.length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
}

export function digForRoomCount(ad: Ad): number {
    const roomsFromTitle = ad.title && ad.title.match(regexString('roomCount')) && ad.title.match(regexString('roomCount'))[0]
    const roomsFromDescription = ad.description && ad.description.match(regexString('roomCount')) && ad.description.match(regexString('roomCount'))[0]
    return (!!ad.rooms && ad.rooms) || stringToNumber(roomsFromTitle) || stringToNumber(roomsFromDescription)
}

export async function digForYearBuilt(ad: Ad, coordinates: Coordinate): Promise<number[]> {
    const building = coordinates && coordinates.lat && coordinates.lng &&
        await yearBuiltService.getBuilding(coordinates.lat, coordinates.lng)
    const yearBuiltFromBuilding = building && yearBuiltService.getYearBuiltFromBuilding(building)

    return ad.yearBuilt && ad.yearBuilt != null && !isNaN(ad.yearBuilt)
        ? [+ad.yearBuilt]
        : yearBuiltFromBuilding
}

export function digForHasFurniture(ad: Ad): boolean {
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

export function digForSurface(ad: Ad): number {
    return ad.surface
        || ad.title && ad.title.match(regexString('surface')) && cleanup.number(ad.title.match(regexString('surface'))[0])
        || ad.description && ad.description.match(regexString('surface')) && cleanup.number(ad.description.match(regexString('surface'))[0])
}

export function digForPrice(ad: Ad): number {
    return ad.price
}

export function digForRenter(ad: Ad): string {
    return possibleBadRenter.includes(ad.renter) ? null : ad.renter
}

export function digForStations(ad: Ad): string[] {
    const stationsFromDescription = ad?.description && stationService.getStations(ad.description) as string[]
    return ad.stations || stationsFromDescription
}

export function digForCharges(ad: Ad): number {
    return ad.charges || ad.description && ad.description.match(regexString('charges')) && cleanup.price(ad.description.match(regexString('charges'))[0])
}

export function digForHasCharges(ad: Ad): boolean {
    return ad.hasCharges
}
