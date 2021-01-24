import * as fs from 'fs'
import * as path from 'path'
import * as cleanup from '@helpers/cleanup'
import Fuse from 'fuse.js'
import { Coordinate } from '@interfaces/shared'
import { AddressItem } from '@interfaces/json-item'
import { postalCodePossibilities } from '@helpers/postal-code'
import { Ad } from '@interfaces/ad'
import { regexString } from '@helpers/regex'
import { Memoize } from 'typescript-memoize'

const parisAddresses: AddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))

interface AddressInfo {
    postalCode: string
    city?: string
}
export class AddressService {
    ad: Ad = null

    constructor (
        ad: Ad,
    ) {
        this.ad = ad
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
        return this.ad.cityLabel?.match(/[A-Za-z]+/g) && cleanup.string(this.ad.cityLabel.match(/[A-Za-z]+/g)[0])
            || (this.getPostalCode() && this.getPostalCode().toString().startsWith('75') ? 'paris' : null)
    }

    @Memoize()
    getAddress() {
        const city = this.getCity()
        const postalCode = this.getPostalCode()
        return this.ad.address || (this.ad.description && this.digForAddressInText(this.ad.description, { city, postalCode })) || (this.ad.title && this.digForAddressInText(this.ad.title, { city, postalCode }))
    }

    getCoordinate(): Coordinate {
        const coordinatesFromAd = this.ad.coord?.lng && this.ad.coord?.lat ? {
            lng: this.ad.coord.lng,
            lat: this.ad.coord.lat,
        } : null

        if (coordinatesFromAd?.lng.toString().length > 9 && coordinatesFromAd?.lat.toString().length > 9) {
            return coordinatesFromAd
        } else {
            const address = this.getAddress()
            const postalCode = this.getPostalCode()

            // Try to find coord if the address precision is good enough (with number)
            if (address?.match(/^\d+/gi)) {
                return this.coordinateFromAddress(address, postalCode) || coordinatesFromAd
            } else {
                return coordinatesFromAd
            }
        }
    }

    coordinateFromAddress(address: string, postalCode: string) {
        const addressInParis = this.getAddressInParis(address, { postalCode })
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

    private digForAddressInText(text: string, { city, postalCode }: AddressInfo): string {
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
    private getAddressInParis(q: string, addressInfo: AddressInfo): { item: AddressItem }[] {
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
            if (!(addressInfo && addressInfo.postalCode)) {
                return true
            }
    
            // 75010 -> 10 75009 -> 9
            const code = (addressInfo.postalCode.slice(-2)[0] === '0' ? addressInfo.postalCode.slice(-1) : addressInfo.postalCode.slice(-2))
            return code ? address.fields.c_ar === +code : true
        }), options)
    
        const result: { item: AddressItem }[] = fuse.search(q) as any
        return result?.length ? result : null
    }
}


