import * as cleanup from '@helpers/cleanup';
import { min } from "@helpers/functions";
import { postalCodePossibilities } from "@helpers/postal-code";
import { regexString } from "@helpers/regex";
import { Ad } from "@interfaces/ad";
import { AddressDiggerOutput, AddressDigStrategy } from "@interfaces/addressdigger";
import { ParisAddressItem, ParisStationItem } from "@interfaces/json-item";
import { Coordinate } from "@interfaces/shared";
import { StationDigger } from '@interfaces/stationdigger';
import { DistanceService } from "@services/distance";
import * as fs from 'fs';
import Fuse from "fuse.js";
import path from "path";
import inside from "point-in-polygon";
import { Memoize } from "typescript-memoize";


const parisAddresses: ParisAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))

export class ParisAddressDigger implements AddressDigStrategy {
    city: string;
    postalCode: string;
    address: string
    stations: string[]
    coordinates: Coordinate
    blurryCoordinates: Coordinate
    ad: Ad
    distanceService: DistanceService;
    stationDigger: StationDigger
    constructor(
        city: string,
    ) {
        this.city = city
        this.distanceService = new DistanceService(this.getPostalCode())
        this.stationDigger = new StationDigger(this.city)
    }

    digForAddress(ad: Ad): AddressDiggerOutput {
        this.ad = ad
        this.postalCode = this.getPostalCode()
        this.address = this.getAddress()
        this.coordinates = this.getCoordinate()
        this.blurryCoordinates = this.getCoordinate(true)
        this.stations = this.stationDigger.getStations(ad, this.postalCode)
        return { address: this.address, postalCode: this.postalCode, city: this.city, stations: this.stations, coordinates: this.coordinates, blurryCoordinates: this.blurryCoordinates }
    }

    @Memoize()
    getPostalCode() {
        let postalCode = this.ad.postalCode || this.ad.cityLabel
            && (this.digForPostalCode(this.ad.cityLabel) || this.digForPostalCode2(this.ad.cityLabel))
            || this.ad.title && (this.digForPostalCode(this.ad.title) || this.digForPostalCode2(this.ad.title))
            || this.ad.description && (this.digForPostalCode(this.ad.description) || this.digForPostalCode2(this.ad.description))

        return postalCode && postalCodePossibilities[this.city].includes(postalCode.toString()) ? postalCode : null
    }

    @Memoize()
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
        return (parisAddresses.reduce((prev, current) => {
            const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.fields.geom.coordinates[1], current.fields.geom.coordinates[0])
            if (dist < prev.dist || !prev.dist) {
                prev = { dist, current }
            }
            return prev;
        }, {} as { current: ParisAddressItem, dist: number }))?.current?.fields?.l_adr;
    }

    private digForPostalCode(text: string): string {
        const postalCodeRe = new RegExp(regexString("postalCode_paris"))
        return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
    }

    private digForPostalCode2(text: string): string {
        const postalCode2Re = new RegExp(regexString("postalCode2_paris"))
        if (!postalCode2Re) return null
        const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
        return match ? match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
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
            keys: ['l_adr'],
            includeScore: true,
            threshold: 0.5,
        }

        const cleanAddress = cleanup.address(q)

        if (!cleanAddress) {
            return null
        }

        const fuse = new Fuse(parisAddresses, options)
        return fuse.search(cleanAddress, { limit }) as { item: ParisAddressItem, score: number }[];
    }


}