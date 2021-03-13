import * as cleanup from '@helpers/cleanup'
import inside from "point-in-polygon"
import { AddressItem, Coordinate } from '@interfaces/shared'
import { Ad } from '@interfaces/ad'
import { regexString } from '@helpers/regex'
import { Memoize } from 'typescript-memoize'
import { min } from '@helpers/functions'
import { DistanceService } from '../distance';
import { AvailableCities, cityList } from './city'
import Fuse from "fuse.js";

export abstract class AddressService {
    ad: Ad = null;
    city: AvailableCities = null
    postalCode: string;
    coordinates: Coordinate;
    blurryCoordinates: Coordinate;

    constructor(city: AvailableCities, ad: Ad) {
        this.ad = ad
        this.city = city
    }

    getAddress(): string {
        return (this.ad.address && this.digForAddressInText(this.ad.address))
            || (this.ad.title && this.digForAddressInText(this.ad.title))
            || (this.ad.description && this.digForAddressInText(this.ad.description))
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

    abstract getAddressCompleted(q: string): { item: AddressItem, score: number, matches: ReadonlyArray<Fuse.FuseResultMatch> }[]
    abstract getTargetPolygon(): number[][]
    abstract addressFromCoordinate(coord: Coordinate): string

    @Memoize()
    digForPostalCode(): string {
        // for hellemmes and lomme
        if (cityList[this.city].postalCodePossibilities.length === 1) {
            return cityList[this.city].postalCodePossibilities[0]
        }

        const postalCode = this.ad.postalCode && this.digForPostalCode1(this.ad.postalCode)
            || this.ad.cityLabel && (this.digForPostalCode1(this.ad.cityLabel) || this.digForPostalCode2(this.ad.cityLabel))
            || this.ad.title && (this.digForPostalCode1(this.ad.title) || this.digForPostalCode2(this.ad.title))
            || this.ad.description && (this.digForPostalCode1(this.ad.description) || this.digForPostalCode2(this.ad.description))

        return postalCode && cityList[this.city].postalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
    }

    protected digForPostalCode1(text: string): string {
        const postalCodeRe = new RegExp(cityList[this.city].postalCodeRegex[0]);
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

        if (addressesFromRegex?.length) {
            const addressesQuery = this.querifyAddresses(addressesFromRegex)
            const addresses: { item: AddressItem, score: number, matches: ReadonlyArray<Fuse.FuseResultMatch> }[] = this.getAddressCompleted(addressesQuery)
            const rawAddresses = this.unquerifyAddresses(addressesQuery);

            const result = addresses.map(res => ({
                ...res,
                streetNumber: this.findStreetNumber(rawAddresses, res.matches[0]),
            }))

            if (result?.length) {
                this.setCoordinates(result[0].item.coordinate, result[0].streetNumber)
                // Not sure about that anymore...
                // this.setPostalCode(result[0].item.postalCode)

                if (this.city === "paris") {
                    // More precision with polygon that we are targeting for sure
                    const resultInPostalCode = this.nearestAddressInTargetPolygon(result)
                    return resultInPostalCode ? (
                        resultInPostalCode.streetNumber ?
                            cleanup.string(resultInPostalCode.address).replace(/^\d+/g, resultInPostalCode.streetNumber.toString()) :
                            cleanup.string(resultInPostalCode.address).replace(/^\d+/g, "").trim()
                    ) : null;
                } else {
                    return result[0].streetNumber ?
                        cleanup.string(result[0].item.address).replace(/^\d+/g, result[0].streetNumber.toString()) :
                        cleanup.string(result[0].item.address).replace(/^\d+/g, "").trim()
                }
            } else {
                return null
            }
        } else {
            return null
        }
    }

    private querifyAddresses(addressesFromRegex: string[]): string {
        return addressesFromRegex
            .map(a => cleanup.address(a, this.city) ? `"${cleanup.address(a, this.city)}"` : null)
            .filter(Boolean).join(' | ');
    }

    private unquerifyAddresses(query: string): string[] {
        return query.split(' | ').map(q => q.substring(1, q.length - 1));
    }

    private findStreetNumber(rawAddresses: string[], match: Fuse.FuseResultMatch): number {
        const toHighlight: string[] = match.indices.map(indice => match.value.slice(indice[0], indice[1] + 1).trim())
        const matchRawAddress: string = rawAddresses.reduce((prev: [number, string], addr: string) => {
            const currentCpt = toHighlight.filter(high => addr.includes(high.toLowerCase())).length;
            return (currentCpt > prev[0]) ? [currentCpt, addr] : prev;
        }, [0, null])[1] as string;
        return +cleanup.string(matchRawAddress)?.match(/^\d+/g) || null
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

        const bah = min(pointByDist.reverse(), 'dist')

        // marge d'erreur : 250m (je crois)
        const confidenceThreshold = 0.0025
        if (bah.dist > confidenceThreshold) {
            return null;
        }

        const coord = { lng: bah.point[0], lat: bah.point[1] }
        if (bah.dist === 0) {
            this.setCoordinates(coord, bah.streetNumber)
            return { address: bah.item.address, streetNumber: bah.streetNumber }
        } else {
            this.setCoordinates(coord, null)
            // Convert the best coord approximation in address string
            return { address: this.addressFromCoordinate(coord), streetNumber: null };
        }
    }
}


