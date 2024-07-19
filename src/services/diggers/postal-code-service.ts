import { Ad } from '@interfaces/ad'
import { AvailableCities, AvailableMainCities, getCityList } from '@services/filters/city-filter/city-list'
import { postalCodes } from '@services/filters/city-filter/postal-codes'
import { haveArrondissements } from '@services/filters/city-filter/have-arrondissements'

export class PostalCodeService {
  private mainCity: AvailableMainCities
  protected city: AvailableCities | 'all'

  constructor(mainCity: AvailableMainCities, city: AvailableCities | 'all') {
    this.mainCity = mainCity
    this.city = city
  }

  getPostalCodePossibilities(): string[] {
    if (this.city === 'all') {
      return getCityList(this.mainCity).flatMap(city => postalCodes(city).postalCodes)
    } else {
      return postalCodes(this.city).postalCodes
    }
  }

  getPostalCode(ad: Ad): string {
    return ad.postalCode || this.digForPostalCode(ad)
  }

  protected digForPostalCode(ad: Ad): string {
    const postalCodePossibilities: string[] = this.getPostalCodePossibilities()
    if (postalCodePossibilities?.length === 1) {
      return postalCodePossibilities[0]
    }

    const postalCode =
      (ad.cityLabel && this.startOfPostalCodeFromText(ad.cityLabel)) ||
      (ad.title && this.startOfPostalCodeFromText(ad.title)) ||
      (ad.description && this.startOfPostalCodeFromText(ad.description)) ||
      (postalCodePossibilities[0].endsWith('000') && postalCodePossibilities[0])

    return postalCode && postalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
  }

  protected startOfPostalCodeFromText(text: string): string {
    if (this.city === 'all') return null

    const regexs = postalCodes(this.city).regex

    let postalCodeRe = new RegExp(regexs[0])
    const res = text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()

    if (!res && haveArrondissements(this.city) && regexs.length > 1) {
      postalCodeRe = new RegExp(regexs[1])
      const match = text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()

      // get '75' for '75011'
      const startOfPostalCode = this.getPostalCodePossibilities()[0].slice(0, 2)

      return match ? (match.length === 1 ? `${startOfPostalCode}00${match}` : `${startOfPostalCode}0${match}`) : null
    } else {
      return null
    }
  }
}
