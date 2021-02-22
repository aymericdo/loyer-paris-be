import * as cleanup from '@helpers/cleanup'
import inside from "point-in-polygon"
import { AddressItem, Coordinate } from '@interfaces/shared'
import { postalCodePossibilities } from '@helpers/postal-code'
import { Ad } from '@interfaces/ad'
import { regexString } from '@helpers/regex'
import { Memoize } from 'typescript-memoize'
import { min } from '@helpers/functions'
import { DistanceService } from '../distance';
import { AvailableCities } from './city'

export abstract class AddressService {
    ad: Ad = null;
    city: AvailableCities = null
    postalCode: string;
    coordinates: Coordinate;
    blurryCoordinates: Coordinate;

    constructor (ad: Ad) {
        this.ad = ad
    }

    getAddress() {
        return (this.ad.address && this.digForAddressInText(this.ad.address))
            || (this.ad.description && this.digForAddressInText(this.ad.description))
            || (this.ad.title && this.digForAddressInText(this.ad.title))
    }

    getPostalCode(): string {
        return this.postalCode || this.digForPostalCode()
    }

    getCoordinate(blurry = false): Coordinate {
        const coordinatesFromAd = this.ad.coord?.lng && this.ad.coord?.lat ? {
            lng: this.ad.coord.lng,
            lat: this.ad.coord.lat,
        } : null

        if (coordinatesFromAd?.lng.toString().length > 9 && coordinatesFromAd?.lat.toString().length > 9) {
            return coordinatesFromAd
        } else {
            if (blurry) {
                return this.blurryCoordinates || coordinatesFromAd;
            } else {
                return this.coordinates || coordinatesFromAd;
            }
        }
    }

    getStations(): string[] {
        return []
    }

    abstract getAddressCompleted(q: string, limit: number): { item: AddressItem, score: number }[]
    abstract getTargetPolygon(): number[][]
    abstract addressFromCoordinate(coord: Coordinate): string

    @Memoize()
    private digForPostalCode(): string {
        const postalCode = this.ad.postalCode && this.digForPostalCode1(this.ad.postalCode)
            || this.ad.cityLabel && (this.digForPostalCode1(this.ad.cityLabel) || this.digForPostalCode2(this.ad.cityLabel))
            || this.ad.title && (this.digForPostalCode1(this.ad.title) || this.digForPostalCode2(this.ad.title))
            || this.ad.description && (this.digForPostalCode1(this.ad.description) || this.digForPostalCode2(this.ad.description))
    
        return postalCode && postalCodePossibilities[this.city].includes(postalCode.toString()) ? postalCode : null
    }

    protected digForPostalCode1(text: string): string {
        const postalCodeRe = new RegExp(regexString(`postalCode_${this.city}`));
        return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim();
    }
    
    protected digForPostalCode2(_text: string): string {
        return null;
    }

    protected setCoordinates(coord: Coordinate, streetNumber: number): void {
        if (streetNumber) {
            this.coordinates = { ...coord }
        } else {
            this.blurryCoordinates = { ...coord }
        }
    }

    protected setPostalCode(postalCode: string): void {
        this.postalCode = postalCode
    }

    private digForAddressInText(text: string): string {
        const addressRe = new RegExp(regexString('address'))
        const addressesFromRegex = text.match(addressRe) as string[]
        if (addressesFromRegex) {
            const sanitizedAddresses = this.sanitizeAddresses(addressesFromRegex)
            const maxResult = 10
            let bigScoreFound: boolean = false;
            const result = sanitizedAddresses.flatMap(address => {
                if (bigScoreFound) return null
                const streetNumber: number = +cleanup.string(address.trim()).match(/^\d+/gi)
                const addresses: { item: AddressItem, score: number }[] = this.getAddressCompleted(address, maxResult / sanitizedAddresses.length > 0 ? maxResult / sanitizedAddresses.length : 1)
                bigScoreFound = addresses && addresses[0].score < 0.15
                return addresses && addresses.map(res => ({ ...res, streetNumber }))
            }).filter(Boolean).sort((a, b) => a.score - b.score)

            if (result?.length) {
                this.setCoordinates(result[0].item.coordinate, result[0].streetNumber)
                this.setPostalCode(result[0].item.postalCode)

                // More precision with polygon that we are targeting for sure
                const resultInPostalCode = this.nearestAddressInTargetPolygon(result)
                return resultInPostalCode ? (
                    resultInPostalCode.streetNumber ?
                        cleanup.string(resultInPostalCode.address).replace(/^\d+/gi, resultInPostalCode.streetNumber.toString()) :
                        cleanup.string(resultInPostalCode.address).replace(/^\d+/gi, "").trim()
                    ) : result[0].streetNumber ?
                        cleanup.string(result[0].item.address).replace(/^\d+/gi, result[0].streetNumber.toString())  :
                        cleanup.string(result[0].item.address).replace(/^\d+/gi, "").trim()
            } else {
                return null
            }
        } else {
            return null
        }
    }

    private sanitizeAddresses(addressesFromRegex: string[]): string[] {
        if (addressesFromRegex.length > 2
            && addressesFromRegex.some(a => ['rue', 'avenue', 'passage', 'boulevard', 'faubourg', 'bd'].some(t => a.includes(t)))) {
            // removing "place", "jardin" or other not relevant stuff if we have enough stock
           return addressesFromRegex.filter(a => ['rue', 'avenue', 'passage', 'boulevard', 'faubourg', 'bd'].some(t => a.includes(t)))  
        } else {
            return addressesFromRegex
        }
    }

    private nearestAddressInTargetPolygon(
        addressesCompleted: { item: AddressItem, streetNumber: number, score: number }[]
      ): { address: string, streetNumber: number } {
        const targetPolygon = this.getTargetPolygon()

        if (!targetPolygon) return null
    
        const pointByDist: { point: number[], dist: number, item: AddressItem, streetNumber: number }[] =
            addressesCompleted.map(address => {
                const point = [address.item.coordinate.lng, address.item.coordinate.lat];
        
                if (inside(point, targetPolygon)) {
                    return { point, dist: 0, item: address.item, streetNumber: address.streetNumber }
                } else {
                    // Get the closest coord but in the right target
                    const { point: resPoint, dist } = DistanceService.distanceToPoly(point as [number, number], targetPolygon as [number, number][])
                    return { point: resPoint, dist, item: address.item, streetNumber: address.streetNumber }
                }
            });
    
        if (!pointByDist.length) return null
    
        if (pointByDist[0].dist === 0) {
            const insidePostalCodeCase = pointByDist[0] as { item: AddressItem, streetNumber: number, point: number[] };
            this.setCoordinates({ lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] }, insidePostalCodeCase.streetNumber)

            return { address: insidePostalCodeCase.item.address, streetNumber: insidePostalCodeCase.streetNumber }
        } else {
            const bah = min(pointByDist, 'dist')
    
            // marge d'erreur : 250m (je crois)
            const confidenceThreshold = 0.0025
            if (bah.dist > confidenceThreshold) {
                return null;
            }
    
            const coord = { lng: bah.point[0], lat: bah.point[1] }
            this.setCoordinates(coord, null)
            return {
                // Convert the best coord approximation in address string
                address: this.addressFromCoordinate(coord),
                streetNumber: null,
            };
        }
    }
}


