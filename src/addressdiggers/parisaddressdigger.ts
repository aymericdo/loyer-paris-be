import { digForAddressInText, digForPostalCode } from '@helpers/address';
import * as cleanup from '@helpers/cleanup';
import { regexString } from "@helpers/regex";
import { Ad } from "@interfaces/ad";
import { AddressDiggerOutput, AddressDigStrategy } from "@addressdiggers/addressdigger";
import { ParisAddressItem } from '@interfaces/json-item-paris';
import { AddressDetails, Coordinate } from "@interfaces/shared";
import { StationDigger } from '@stationdiggers/stationdigger';
import { DistanceService } from "@services/distance";
import * as fs from 'fs';
import Fuse from "fuse.js";
import path from "path";
import { Memoize } from "typescript-memoize";
import { AvailableCities } from '@services/city';

const parisAddresses: ParisAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))

const options = {
    keys: ['fields.l_adr'],
    includeScore: true,
    threshold: 0.5,
    minMatchCharLength: 3,
}

const parisPostalCodePossibilities = [
    '75001',
    '75002',
    '75003',
    '75004',
    '75005',
    '75006',
    '75007',
    '75008',
    '75009',
    '75010',
    '75011',
    '75012',
    '75013',
    '75014',
    '75015',
    '75016',
    '75116',
    '75017',
    '75018',
    '75019',
    '75020',
]

const index = Fuse.createIndex(options.keys, parisAddresses)

const parisFuse = new Fuse(parisAddresses, options, index)

export class ParisAddressDigger implements AddressDigStrategy {
    city: AvailableCities;
    postalCode: string;
    address: string
    stations: string[]
    coordinates: Coordinate
    blurryCoordinates: Coordinate
    ad: Ad
    distanceService: DistanceService;
    stationDigger: StationDigger
    constructor(
        city: AvailableCities,
    ) {
        this.city = city
        this.distanceService = new DistanceService()
        this.stationDigger = new StationDigger(this.city)
    }

    digForAddress(ad: Ad): AddressDiggerOutput {
        this.ad = ad
        this.postalCode = this.getPostalCode()
        this.address = this.getAddress()
        this.coordinates = this.getCoordinate()
        this.blurryCoordinates = this.getCoordinate(true)
        this.stations = this.stationDigger.getStations(ad, this.postalCode)
        return { address: this.address, postalCode: this.postalCode, stations: this.stations, coordinates: this.coordinates, blurryCoordinates: this.blurryCoordinates }
    }

    @Memoize()
    getPostalCode() {
        const postalCode = this.ad.postalCode && digForPostalCode(this.ad.postalCode)
            || this.ad.cityLabel && (digForPostalCode(this.ad.cityLabel) || this.digForPostalCode2(this.ad.cityLabel))
            || this.ad.title && (digForPostalCode(this.ad.title) || this.digForPostalCode2(this.ad.title))
            || this.ad.description && (digForPostalCode(this.ad.description) || this.digForPostalCode2(this.ad.description))

        return postalCode && parisPostalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
    }

    @Memoize()
    getAddress() {
        return (this.ad.address && digForAddressInText(this.ad.address))
            || (this.ad.description && digForAddressInText(this.ad.description))
            || (this.ad.title && digForAddressInText(this.ad.title))
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

    digForPostalCode2(text: string): string {
        const postalCode2Re = new RegExp(regexString(`postalCode2_${this.city}`))
        const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
        return match ? match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
    }

    @Memoize()
    getAddressCompleted(q: string, limit: number): { item: AddressDetails, score: number }[] {
        const cleanAddress = cleanup.address(q, this.city)

        if (!cleanAddress) {
            return null
        }
        const result = parisFuse.search(cleanAddress, { limit }) as { item: ParisAddressItem, score: number }[]
        return result ? result.map((r) => ({
            item: {
                address: r.item.fields.l_adr,
                postalCode: this.postalCodeFormat(r.item.fields.c_ar.toString()),
                coordinate: {
                    lng: r.item.fields.geom.coordinates[0],
                    lat: r.item.fields.geom.coordinates[1],
                },
            },
            score: r.score,
        })) : []
    }

    addressFromCoordinate(coord: Coordinate): string {
        return (parisAddresses.reduce((prev, current) => {
            const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.fields.geom.coordinates[1], current.fields.geom.coordinates[0])
            if (dist < prev.dist || !prev.dist) {
                prev = { dist, current }
            }
            return prev;
        }, {} as { current: any, dist: number }))?.current?.fields?.l_adr;
    }

    private postalCodeFormat(postalCode: string): string {
        // 10 -> 75010 9 -> 75009
        return (postalCode.length === 1) ?
            `7500${postalCode}`
            :
            `750${postalCode}`
    }
}