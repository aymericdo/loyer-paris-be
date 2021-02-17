import * as cleanup from '@helpers/cleanup';
import { regexString } from "@helpers/regex";
import { Ad } from "@interfaces/ad";
import { AddressDigStrategy, AddressInfo } from "@interfaces/addressdigger";
import { AddressItem } from "@interfaces/json-item";
import { Coordinate } from "@interfaces/shared";
import { CityInfo } from "@services/city";
import * as fs from 'fs';
import Fuse from "fuse.js";
import path from "path";
import { Memoize } from "typescript-memoize";

const parisAddresses: AddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))

export class ParisAddressDigger implements AddressDigStrategy {
    cityInfo: CityInfo;
    ad: Ad;
    constructor(
        cityInfo: CityInfo,
    ) {
        this.cityInfo = cityInfo
    }

    digForAddress(ad: Ad): AddressInfo {
        this.ad = ad
        const address = this.getAddress()
        const coordinate = this.getCoordinate()
        return "" as unknown as AddressInfo;
    }

    getAddress() {
        return this.ad.address || (this.ad.description && this.digForAddressInText(this.ad.description, this.cityInfo)) || (this.ad.title && this.digForAddressInText(this.ad.title, this.cityInfo))
    }

    getCoordinate(blurry = false): Coordinate {
        const coordinatesFromAd = this.ad.coord?.lng && this.ad.coord?.lat ? {
            lng: this.ad.coord.lng,
            lat: this.ad.coord.lat,
        } : null

        if (coordinatesFromAd?.lng.toString().length > 9 && coordinatesFromAd?.lat.toString().length > 9) {
            return coordinatesFromAd
        } else {
            const address = this.getAddress()
            const postalCode = this.cityInfo.postalCode

            // Try to find coord if the address precision is good enough (with number)
            if (blurry || address?.match(/^\d+/gi)) {
                return this.coordinateFromAddress(address, postalCode) || coordinatesFromAd
            } else {
                return coordinatesFromAd
            }
        }
    }

    coordinateFromAddress(address: string, postalCode: string) {
        const addressInParis = this.getAddressInParis(address, this.cityInfo)
        const result: AddressItem[] = addressInParis?.map(address => address.item)
        return result && { lat: result[0].fields.geom_x_y[0], lng: result[0].fields.geom_x_y[1] }
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

    private digForAddressInText(text: string, { city, postalCode }: CityInfo): string {
        const addressRe = new RegExp(regexString('address'))
        const addressesFromRegex = text.match(addressRe) as any
        if (city && cleanup.string(city) === 'paris' && addressesFromRegex) {
            const result = addressesFromRegex.flatMap(address => {
                return this.getAddressInParis(address.trim().replace('bd ', 'boulevard '), { postalCode })
            }).filter(Boolean).sort((a, b) => a.score - b.score).map(address => address.item)
            return result && result.length ?
                cleanup.string(addressesFromRegex[0].trim()).match(/^\d+/gi) ?
                    cleanup.string(result[0].fields.l_adr) :
                    cleanup.string(result[0].fields.l_adr).replace(/^\d+/gi, "").trim() :
                null
        } else {
            return addressesFromRegex && addressesFromRegex[0].trim()
        }
    }

    @Memoize()
    private getAddressInParis(q: string, cityInfo: CityInfo): { item: AddressItem }[] {
        const options = {
            keys: ['fields.l_adr'],
            shouldSort: true,
            includeScore: true,
            threshold: 0.5,
            tokenize: true,
            matchAllTokens: true,
        }

        if (!q) {
            return null
        }

        const fuse = new Fuse(parisAddresses.filter(address => {
            if (!(this.cityInfo && this.cityInfo.postalCode)) {
                return true
            }

            // 75010 -> 10 75009 -> 9
            const code = (this.cityInfo.postalCode.slice(-2)[0] === '0' ?
                this.cityInfo.postalCode.slice(-1) : this.cityInfo.postalCode.slice(-2))
            return code ? address.fields.c_ar === +code : true
        }), options)

        const result: { item: AddressItem }[] = fuse.search(q) as any
        return result?.length ? result : null
    }
}