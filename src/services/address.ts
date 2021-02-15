import * as fs from 'fs'
import * as path from 'path'
import * as cleanup from '@helpers/cleanup'
import Fuse from 'fuse.js'
import inside from "point-in-polygon"
import { Coordinate } from '@interfaces/shared'
import { AddressItem, MetroItem } from '@interfaces/json-item'
import { postalCodePossibilities } from '@helpers/postal-code'
import { Ad } from '@interfaces/ad'
import { regexString } from '@helpers/regex'
import { Memoize } from 'typescript-memoize'
import { min } from '@helpers/functions'
import { DistanceService } from './distance';
import { StationService } from './station'

const parisAddresses: AddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))

interface AddressInfo {
    postalCode: string
    city?: string
}
export class AddressService {
    ad: Ad = null
    coordinates: Coordinate;
    blurryCoordinates: Coordinate;
    distanceService: DistanceService;

    constructor (
        ad: Ad,
    ) {
        this.ad = ad
        this.distanceService = new DistanceService(this.getPostalCode())
    }

    @Memoize()
    getPostalCode() {
        let postalCode = this.ad.postalCode || this.ad.cityLabel
            && (this.digForPostalCode(this.ad.cityLabel) || this.digForPostalCode2(this.ad.cityLabel))
            || this.ad.title && (this.digForPostalCode(this.ad.title) || this.digForPostalCode2(this.ad.title))
            || this.ad.description && (this.digForPostalCode(this.ad.description) || this.digForPostalCode2(this.ad.description))
    
        return postalCode && postalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
    }

    @Memoize()
    getCity() {
        return this.ad.cityLabel?.match(/[A-Za-z -]+/g) && cleanup.string(this.ad.cityLabel.match(/[A-Za-z -]+/g)[0])
            || (this.getPostalCode() && this.getPostalCode().toString().startsWith('75') ? 'paris' : null)
    }

    @Memoize()
    getAddress() {
        const city = this.getCity()
        const postalCode = this.getPostalCode()
        return this.ad.address || (this.ad.description && this.digForAddressInText(this.ad.description, { city, postalCode })) || (this.ad.title && this.digForAddressInText(this.ad.title, { city, postalCode }))
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
        const stationsFromDescription: MetroItem[] = this.ad?.description && new StationService(this.ad.description).getStations()
        return this.ad.stations || stationsFromDescription && this.nearestPointInPostalCode(stationsFromDescription)
    }

    addressFromCoordinate(coord: Coordinate): string {
        return (parisAddresses.reduce((prev, current) => {
            const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.fields.geom.coordinates[1], current.fields.geom.coordinates[0])
            if (dist < prev.dist || !prev.dist) {
                prev = { dist, current }
            }
            return prev;
        }, {} as { current: AddressItem, dist: number }))?.current?.fields?.l_adr;
    }

    private digForPostalCode(text: string): string {
        const postalCodeRe = new RegExp(regexString('postalCode'))
        return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
    }
    
    private digForPostalCode2(text: string): string {
        const postalCode2Re = new RegExp(regexString('postalCode2'))
        const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
        return match ? match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
    }

    private digForAddressInText(text: string, { city }: AddressInfo): string {
        const addressRe = new RegExp(regexString('address'))
        const addressesFromRegex = text.match(addressRe) as string[]
        const maxResult = 10
        if (city && cleanup.string(city) === 'paris' && addressesFromRegex) {
            const result = addressesFromRegex.flatMap(address => {
                const hasStreetNumber: boolean = !!cleanup.string(addressesFromRegex[0].trim()).match(/^\d+/gi)
                const addressesInParis = this.getAddressInParis(address, maxResult / addressesFromRegex.length > 0 ? maxResult / addressesFromRegex.length : 1)
                return addressesInParis && addressesInParis.map(res => ({ ...res, hasStreetNumber }))
            }).filter(Boolean).sort((a, b) => a.score - b.score)

            const resultInPostalCode = this.nearestAddressInPostalCode(result)

            return resultInPostalCode ?
                !!resultInPostalCode[1] ?
                    cleanup.string(resultInPostalCode[0]) :
                    cleanup.string(resultInPostalCode[0]).replace(/^\d+/gi, "").trim() :
                null
        } else {
            return addressesFromRegex && cleanup.address(addressesFromRegex[0])
        }
    }

    @Memoize()
    private getAddressInParis(q: string, limit: number): { item: AddressItem, score: number }[] {
        const options = {
            keys: ['fields.l_adr'],
            includeScore: true,
            threshold: 0.5,
        }

        const cleanAddress = cleanup.address(q)

        if (!cleanAddress) {
            return null
        }

        const fuse = new Fuse(parisAddresses, options)
        return fuse.search(cleanAddress, { limit }) as { item: AddressItem, score: number }[];
    }

    private nearestPointInPostalCode(metroItems: MetroItem[]): string[] {
        const postalCodePolygon = this.distanceService.getPolyFromPostalCode()
        const pointByDist = metroItems.map(metro => {
            const point = [metro.lon, metro.lat]
            if (inside(point, postalCodePolygon)) {
                return { point, dist: 0, name: metro.tags.name }
            } else {
                // Get the closest coord but in the right postalCode
                return { ...this.distanceService.distanceToPoly(point as [number, number], postalCodePolygon as [number, number][]), name: metro.tags.name };
            }
        });

        if (!pointByDist.length) return null

        if (pointByDist[0].dist === 0) {
            const insidePostalCodeCase = pointByDist[0] as { name: string, point: number[] };
            this.blurryCoordinates = { lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] };
        } else {
            const bah = min(pointByDist, 'dist')

            // marge d'erreur : 250m
            if (bah.dist < 0.0025) {
                this.blurryCoordinates = { lng: bah.point[0], lat: bah.point[1] }
            }

        }

        return pointByDist.reduce((prev, point) => {
            if (point.dist < 0.0025 && prev.every(elem => elem !== point.name)) {
                prev.push(point.name);
            }
            return prev;
        }, []);
    }

    private nearestAddressInPostalCode(addressesInParis: { item: AddressItem, hasStreetNumber: boolean, score: number }[]): [string, boolean] {
        const postalCodePolygon = this.distanceService.getPolyFromPostalCode()
        const pointByDist = addressesInParis.map(address => {
            const point = address.item.fields.geom.coordinates;
            if (inside(point, postalCodePolygon)) {
                return { point, dist: 0, name: address.item.fields.l_adr, hasStreetNumber: address.hasStreetNumber }
            } else {
                // Get the closest coord but in the right postalCode
                return this.distanceService.distanceToPoly(point as [number, number], postalCodePolygon as [number, number][]);
            }
        });

        if (!pointByDist.length) return null

        if (pointByDist[0].dist === 0) {
            const insidePostalCodeCase = pointByDist[0] as { name: string, hasStreetNumber: boolean, point: number[] };
            insidePostalCodeCase.hasStreetNumber ? 
                this.coordinates = { lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] }
            :
                this.blurryCoordinates = { lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] };
            return [insidePostalCodeCase.name, !!insidePostalCodeCase.hasStreetNumber];
        } else {
            const bah = min(pointByDist, 'dist')

            // marge d'erreur : 250m
            if (bah.dist > 0.0025) {
                return null;
            }

            const coord = { lng: bah.point[0], lat: bah.point[1] }
            this.blurryCoordinates = { ...coord };
            // Convert the best coord approximation in string addr
            return [this.addressFromCoordinate(coord), false]
        }
    }
}


