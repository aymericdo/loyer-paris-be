import { Ad } from '@interfaces/ad'
import { AvailableCities } from '@services/filters/city-filter/city-list'

export class PostalCodeDefault {
  protected postalCodePossibilities: { [city: string]: { postalCodes: string[], regex: RegExp[] } } = null
  private city: AvailableCities | 'all'

  constructor(city: AvailableCities | 'all') {
    this.city = city
  }

  getPostalCodePossibilities(): string[] {
    if (this.city === 'all') {
      return Object.keys(this.postalCodePossibilities).flatMap(city => this.postalCodePossibilities[city].postalCodes)
    } else {
      return this.postalCodePossibilities[this.city].postalCodes
    }
  }

  getPostalCode(ad: Ad): string {
    if (this.city !== 'all') {
      return ad.postalCode || this.digForPostalCode(this.city, ad)
    }
  }

  protected digForPostalCode(city: AvailableCities, ad: Ad): string {
    const postalCodePossibilities: string[] = this.postalCodePossibilities[city].postalCodes as unknown as string[]
    if (postalCodePossibilities?.length === 1) {
      return postalCodePossibilities[0]
    }

    const postalCode =
      (ad.cityLabel && (this.digForPostalCode1(city, ad.cityLabel) || this.digForPostalCode2(city, ad.cityLabel))) ||
      (ad.title && (this.digForPostalCode1(city, ad.title) || this.digForPostalCode2(city, ad.title))) ||
      (ad.description &&
        (this.digForPostalCode1(city, ad.description) || this.digForPostalCode2(city, ad.description))) ||
      (postalCodePossibilities[0].endsWith('000') && postalCodePossibilities[0])

    return postalCode && postalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
  }

  protected digForPostalCode1(city: AvailableCities, text: string): string {
    const postalCodeRe = new RegExp(this.postalCodePossibilities[city].regex[0])
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
  }

  protected digForPostalCode2(_city: AvailableCities, _text: string): string {
    return null
  }
}
