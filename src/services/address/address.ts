// import * as cleanup from '@helpers/cleanup'
// import Fuse from 'fuse.js'
// import inside from "point-in-polygon"
// import { Coordinate } from '@interfaces/shared'
// import { AddressItem, MetroItem } from '@interfaces/json-item'
// import { postalCodePossibilities } from '@helpers/postal-code'
// import { Ad } from '@interfaces/ad'
// import { regexString } from '@helpers/regex'
// import { Memoize } from 'typescript-memoize'
// import { min } from '@helpers/functions'
// import { DistanceService } from '../distance';
// import { cityList } from './city'

// export abstract class AddressService {
//     ad: Ad = null;
//     city: string = null
//     coordinates: Coordinate;
//     blurryCoordinates: Coordinate;

//     constructor (
//         ad: Ad,
//     ) {
//         this.ad = ad
//     }

//     @Memoize()
//     distanceService() {
//         return new DistanceService(this.getPostalCode());
//     }

//     @Memoize()
//     getPostalCode() {
//         let postalCode = this.digForPostalCode(this.ad.postalCode)
//         || this.ad.cityLabel && (this.digForPostalCode(this.ad.cityLabel) || this.digForPostalCode2(this.ad.cityLabel))
//         || this.ad.title && (this.digForPostalCode(this.ad.title) || this.digForPostalCode2(this.ad.title))
//         || this.ad.description && (this.digForPostalCode(this.ad.description) || this.digForPostalCode2(this.ad.description))
    
//         return postalCode && postalCodePossibilities[this.city].includes(postalCode.toString()) ? postalCode : null
//     }

//     @Memoize()
//     getAddress() {
//         return (this.ad.address && this.digForAddressInText(this.ad.address))
//             || (this.ad.description && this.digForAddressInText(this.ad.description))
//             || (this.ad.title && this.digForAddressInText(this.ad.title))
//     }

//     getCoordinate(blurry = false): Coordinate {
//         const coordinatesFromAd = this.ad.coord?.lng && this.ad.coord?.lat ? {
//             lng: this.ad.coord.lng,
//             lat: this.ad.coord.lat,
//         } : null

//         if (coordinatesFromAd?.lng.toString().length > 9 && coordinatesFromAd?.lat.toString().length > 9) {
//             return coordinatesFromAd
//         } else {
//             if (blurry) {
//                 return this.blurryCoordinates || coordinatesFromAd;
//             } else {
//                 return this.coordinates || coordinatesFromAd;
//             }
//         }
//     }

//     getStations(): string[] {
//         return []
//     }

//     protected digForPostalCode(text: string): string {
//         const postalCodeRe = new RegExp(regexString(`postalCode_${this.city}`));
//         return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim();
//     }
    
//     protected digForPostalCode2(_text: string): string {
//         return null;
//     }

//     private addressFromCoordinate(coord: Coordinate): string {
//         return (cityList[this.city].addresses.reduce((prev, current) => {
//             const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.fields.geom.coordinates[1], current.fields.geom.coordinates[0])
//             if (dist < prev.dist || !prev.dist) {
//                 prev = { dist, current }
//             }
//             return prev;
//         }, {} as { current: AddressItem, dist: number }))?.current?.fields[cityList[this.city].addressesField];
//     }

//     private digForAddressInText(text: string): string {
//         const addressRe = new RegExp(regexString('address'))
//         const addressesFromRegex = text.match(addressRe) as string[]
//         if (addressesFromRegex) {
//             const maxResult = 10
//             const result = addressesFromRegex.flatMap(address => {
//                 const hasStreetNumber: boolean = !!cleanup.string(addressesFromRegex[0].trim()).match(/^\d+/gi)
//                 const addresses = this.getAddressCompleted(address, maxResult / addressesFromRegex.length > 0 ? maxResult / addressesFromRegex.length : 1)
//                 return addresses && addresses.map(res => ({ ...res, hasStreetNumber }))
//             }).filter(Boolean).sort((a, b) => a.score - b.score)
            
//             if (this.getPostalCode()) {
//                 const resultInPostalCode = this.nearestAddressInPostalCode(result)

//                 return resultInPostalCode ?
//                     !!resultInPostalCode[1] ?
//                         cleanup.string(resultInPostalCode[0]) :
//                         cleanup.string(resultInPostalCode[0]).replace(/^\d+/gi, "").trim() :
//                     null
//             } else {
//                 return result.length ?
//                     cleanup.string(addressesFromRegex[0].trim()).match(/^\d+/gi) ?
//                         cleanup.string(result[0].item.fields[cityList[this.city].addressesField]) :
//                         cleanup.string(result[0].item.fields[cityList[this.city].addressesField]).replace(/^\d+/gi, "").trim() :
//                     null
//             }
//         } else {
//             return addressesFromRegex && cleanup.address(addressesFromRegex[0])
//         }
//     }

//     @Memoize()
//     private getAddressCompleted(q: string, limit: number): { item: AddressItem, score: number }[] {
//         const options = {
//             keys: [`fields.${cityList[this.city].addressesField}`],
//             includeScore: true,
//             threshold: 0.5,
//         }

//         const cleanAddress = cleanup.address(q)

//         if (!cleanAddress) {
//             return null
//         }

//         const fuse = new Fuse(cityList[this.city].addresses, options)
//         return fuse.search(cleanAddress, { limit }) as { item: AddressItem, score: number }[];
//     }

//     private nearestAddressInPostalCode(addressesCompleted: { item: AddressItem, hasStreetNumber: boolean, score: number }[]): [string, boolean] {
//         const postalCodePolygon = this.distanceService().getPolyFromPostalCode()

//         if (!postalCodePolygon) return null

//         const pointByDist = addressesCompleted.map(address => {
//             const point = address.item.fields.geom.coordinates;
//             if (inside(point, postalCodePolygon)) {
//                 return { point, dist: 0, name: address.item.fields[cityList[this.city].addressesField], hasStreetNumber: address.hasStreetNumber }
//             } else {
//                 // Get the closest coord but in the right postalCode
//                 return this.distanceService().distanceToPoly(point as [number, number], postalCodePolygon as [number, number][]);
//             }
//         });

//         if (!pointByDist.length) return null

//         if (pointByDist[0].dist === 0) {
//             const insidePostalCodeCase = pointByDist[0] as { name: string, hasStreetNumber: boolean, point: number[] };
//             insidePostalCodeCase.hasStreetNumber ? 
//                 this.coordinates = { lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] }
//             :
//                 this.blurryCoordinates = { lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] };
//             return [insidePostalCodeCase.name, !!insidePostalCodeCase.hasStreetNumber];
//         } else {
//             const bah = min(pointByDist, 'dist')

//             // marge d'erreur : 250m
//             if (bah.dist > 0.0025) {
//                 return null;
//             }

//             const coord = { lng: bah.point[0], lat: bah.point[1] }
//             this.blurryCoordinates = { ...coord };
//             // Convert the best coord approximation in string addr
//             return [this.addressFromCoordinate(coord), false]
//         }
//     }
// }


