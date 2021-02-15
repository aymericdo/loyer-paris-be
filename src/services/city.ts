import * as cleanup from '@helpers/cleanup'
import { regexString } from '@helpers/regex'
import { Ad } from '@interfaces/ad'

export interface CityInfo {
    postalCode: string
    city?: string
}
export class CityService {
    ad: Ad = null
    adCity: string

    constructor(
        ad: Ad,
    ) {
        this.ad = ad
        this.adCity = this.ad.cityLabel?.match(/[A-Za-z -]+/g) && cleanup.string(this.ad.cityLabel.match(/[A-Za-z -]+/g)[0])
    }

    getCityInfo(): CityInfo {
        return {
            postalCode: this.getPostalCode(),
            city: this.getCity()
        }
    }

    private getPostalCode() {
        let adPostalCode = this.ad.postalCode
        switch (this.adCity) {
            case ("paris"): {
                return adPostalCode
                    && (this.digForPostalCode(this.ad.cityLabel) || this.digForParisDistrict(this.ad.cityLabel))
                    || this.ad.title && (this.digForPostalCode(this.ad.title) || this.digForParisDistrict(this.ad.title))
                    || this.ad.description && (this.digForPostalCode(this.ad.description) || this.digForParisDistrict(this.ad.description))
            }
            case ("lille"): {
                return adPostalCode
                    && this.digForPostalCode(this.ad.cityLabel)
                    || this.ad.title && this.digForPostalCode(this.ad.title)
                    || this.ad.description && this.digForPostalCode(this.ad.description)
            }
            default: {
                return adPostalCode
            }
        }
    }

    private getCity() {
        switch (this.adCity) {
            case ("paris"): {
                return this.adCity || (this.getPostalCode() && this.getPostalCode().toString().startsWith('75') ? 'paris' : null)
            }
            case ("lille"): {
                return this.adCity || (this.getPostalCode() && this.getPostalCode().toString().startsWith('59') ? 'lille' : null)
            }
            default: {
                return this.adCity
            }
        }
    }

    private digForPostalCode(text: string): string {
        const postalCodeRe = new RegExp(regexString('postalCode'))
        return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
    }

    private digForParisDistrict(text: string): string {
        const postalCode2Re = new RegExp(regexString('postalCode2'))
        const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
        return match ? match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
    }
}


