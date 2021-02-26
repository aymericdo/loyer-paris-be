import { digForAddressInText, digForPostalCode } from '@helpers/address';
import * as cleanup from '@helpers/cleanup';
import { postalCodePossibilities } from "@helpers/postal-code";
import { Ad } from "@interfaces/ad";
import { AddressDiggerOutput, AddressDigStrategy } from "@addressdiggers/addressdigger";
import { LilleAddressItem } from '@interfaces/json-item-lille';
import { AddressDetails, Coordinate } from "@interfaces/shared";
import { StationDigger } from '@stationdiggers/stationdigger';
import { DistanceService } from "@services/distance";
import * as fs from 'fs';
import Fuse from "fuse.js";
import path from "path";
import { Memoize } from "typescript-memoize";


const lilleAddresses: LilleAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'))

const options = {
    keys: ['fields.auto_adres'],
    includeScore: true,
    threshold: 0.5,
    minMatchCharLength: 3,
}

const lillePostalCodePossibilities = [
    '59000', '59260', '59160', '59800', '59777'
]

const index = Fuse.createIndex(options.keys, lilleAddresses)

const lilleFuse = new Fuse(lilleAddresses, options, index)

export class LilleAddressDigger implements AddressDigStrategy {
    address: string
    postalCode: string;
    city: string;
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
            || this.ad.cityLabel && (digForPostalCode(this.ad.cityLabel))
            || this.ad.title && (digForPostalCode(this.ad.title))
            || this.ad.description && (digForPostalCode(this.ad.description))

        return postalCode && lillePostalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
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

    @Memoize()
    getAddressCompleted(q: string, limit: number): { item: AddressDetails, score: number }[] {
        const cleanAddress = cleanup.address(q, this.city)

        if (!cleanAddress) {
            return null
        }

        const result = lilleFuse.search(cleanAddress, { limit }) as { item: LilleAddressItem, score: number }[]
        return result ? result.map((r) => ({
            item: {
                address: r.item.fields.auto_adres,
                postalCode: r.item.fields.cpostal.toString(),
                coordinate: {
                    lng: r.item.geometry.coordinates[0],
                    lat: r.item.geometry.coordinates[1],
                },
            },
            score: r.score,
        })) : []
    }

    addressFromCoordinate(coord: Coordinate): string {
        return (lilleAddresses.reduce((prev, current) => {
            const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.geometry.coordinates[1], current.geometry.coordinates[0])
            if (dist < prev.dist || !prev.dist) {
                prev = { dist, current }
            }
            return prev;
        }, {} as { current: any, dist: number }))?.current?.fields?.auto_adres;
    }
}