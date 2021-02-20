import * as cleanup from '@helpers/cleanup';
import { min } from "@helpers/functions";
import { postalCodePossibilities } from "@helpers/postal-code";
import { regexString } from "@helpers/regex";
import { Ad } from "@interfaces/ad";
import { AddressDiggerOutput, AddressDigStrategy } from "@interfaces/addressdigger";
import { LilleAddressItem, LilleStationItem, ParisAddressItem } from "@interfaces/json-item";
import { Coordinate } from "@interfaces/shared";
import { DistanceService } from "@services/distance";
import * as fs from 'fs';
import Fuse from "fuse.js";
import path from "path";
import inside from "point-in-polygon";
import { Memoize } from "typescript-memoize";


const lilleAddresses: ParisAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'))

export class LilleAddressDigger implements AddressDigStrategy {
    address: string
    postalCode: string;
    city: string;
    stations: string[]
    coordinates: Coordinate
    blurryCoordinates: Coordinate
    ad: Ad
    distanceService: DistanceService;
    constructor(
        city: string,
    ) {
        this.city = city
        this.distanceService = new DistanceService(this.getPostalCode())
    }

    digForAddress(ad: Ad): AddressDiggerOutput {
        this.ad = ad
        this.postalCode = this.getPostalCode()
        this.address = this.getAddress()
        this.stations = this.getStations()
        this.coordinates = this.getCoordinate()
        this.blurryCoordinates = this.getCoordinate(true)
        return { address: this.address, postalCode: this.postalCode, city: this.city, stations: this.stations, coordinates: this.coordinates, blurryCoordinates: this.blurryCoordinates }
    }

    getPostalCode() {
        let postalCode = this.ad.postalCode || this.ad.cityLabel
            && this.digForPostalCode(this.ad.cityLabel)
            || this.ad.title && this.digForPostalCode(this.ad.title)
            || this.ad.description && this.digForPostalCode(this.ad.description)

        return postalCode && postalCodePossibilities[this.city].includes(postalCode.toString()) ? postalCode : null
    }

    getAddress() {
        return this.ad.address || (this.ad.description && this.digForAddressInText(this.ad.description)) || (this.ad.title && this.digForAddressInText(this.ad.title))
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

    addressFromCoordinate(coord: Coordinate): string {
        return (lilleAddresses.reduce((prev, current) => {
            const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.fields.geom.coordinates[1], current.fields.geom.coordinates[0])
            if (dist < prev.dist || !prev.dist) {
                prev = { dist, current }
            }
            return prev;
        }, {} as { current: ParisAddressItem, dist: number }))?.current?.fields?.l_adr;
    }

    private digForPostalCode(text: string): string {
        const postalCodeRe = new RegExp(regexString("postalCode_lille"))
        return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
    }

    private digForAddressInText(text: string): string {
        const addressRe = new RegExp(regexString('address'))
        const addressesFromRegex = text.match(addressRe) as string[]
        const maxResult = 10
        if (addressesFromRegex) {
            const result = addressesFromRegex.flatMap(address => {
                const hasStreetNumber: boolean = !!cleanup.string(addressesFromRegex[0].trim()).match(/^\d+/gi)
                const addresses = this.getAddressCompleted(address, maxResult / addressesFromRegex.length > 0 ? maxResult / addressesFromRegex.length : 1)
                return addresses && addresses.map(res => ({ ...res, hasStreetNumber }))
            }).filter(Boolean).sort((a, b) => a.score - b.score)

            return result.length ?
                cleanup.string(addressesFromRegex[0].trim()).match(/^\d+/gi) ?
                    cleanup.string(result[0].item.fields['auto_adres']) :
                    cleanup.string(result[0].item.fields['auto_adres']).replace(/^\d+/gi, "").trim() :
                null

        } else {
            return addressesFromRegex && cleanup.address(addressesFromRegex[0])
        }
    }

    @Memoize()
    private getAddressCompleted(q: string, limit: number): { item: ParisAddressItem, score: number }[] {
        const options = {
            keys: ['auto_adres'],
            includeScore: true,
            threshold: 0.5,
        }

        const cleanAddress = cleanup.address(q)

        if (!cleanAddress) {
            return null
        }

        const fuse = new Fuse(lilleAddresses, options)
        return fuse.search(cleanAddress, { limit }) as { item: ParisAddressItem, score: number }[];
    }

    private nearestPointInPostalCode(metroItems: LilleStationItem[]): string[] {
        const postalCodePolygon = this.distanceService.getPolyFromPostalCode()

        if (!postalCodePolygon) return null

        const pointByDist = metroItems.map(metro => {
            const point = [metro.fields.stop_coordinates[0], metro.fields.stop_coordinates[1]]
            if (inside(point, postalCodePolygon)) {
                return { point, dist: 0, name: metro.fields.stop_name }
            } else {
                // Get the closest coord but in the right postalCode
                return { ...this.distanceService.distanceToPoly(point as [number, number], postalCodePolygon as [number, number][]), name: metro.fields.stop_name };
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

    private nearestAddressInPostalCode(addressesCompleted: { item: LilleAddressItem, hasStreetNumber: boolean, score: number }[]): [string, boolean] {
        const postalCodePolygon = this.distanceService.getPolyFromPostalCode()

        if (!postalCodePolygon) return null

        const pointByDist = addressesCompleted.map(address => {
            const point = address.item.fields.geo_point_2d;
            if (inside(point, postalCodePolygon)) {
                return { point, dist: 0, name: `${address.item.fields.typevoie} ${address.item.fields.nomvoie}`, hasStreetNumber: address.hasStreetNumber }
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