import { Ad } from '@interfaces/ad'
import { AvailableCities, AvailableMainCities, getCityList } from '@services/filters/city-filter/city-list'
import { postalCodes } from '@services/filters/city-filter/postal-codes'

export class PostalCodeDefault {
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
      (ad.cityLabel && (this.digForPostalCode1(ad.cityLabel) || this.digForPostalCode2(ad.cityLabel))) ||
      (ad.title && (this.digForPostalCode1(ad.title) || this.digForPostalCode2(ad.title))) ||
      (ad.description &&
        (this.digForPostalCode1(ad.description) || this.digForPostalCode2(ad.description))) ||
      (postalCodePossibilities[0].endsWith('000') && postalCodePossibilities[0])

    return postalCode && postalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
  }

  protected digForPostalCode1(text: string): string {
    if (this.city === 'all') return null

    const postalCodeRe = new RegExp(postalCodes(this.city).regex[0])
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
  }

  protected digForPostalCode2(_text: string): string {
    return null
  }
}
