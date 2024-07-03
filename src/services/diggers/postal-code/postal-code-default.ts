import { Ad } from '@interfaces/ad'
import { PostalCodeStrategy } from '@services/diggers/postal-code/postal-code-factory'
import { AvailableCities, cityList } from '@services/filters/city-filter/valid-cities-list'

export class DefaultPostalCodeStrategy implements PostalCodeStrategy {
  private city: AvailableCities
  private ad: Ad

  constructor(city: AvailableCities, ad: Ad) {
    this.city = city
    this.ad = ad
  }

  public getPostalCode(): string {
    return this.ad.postalCode || this.digForPostalCode(this.city, this.ad)
  }

  protected digForPostalCode(city: AvailableCities, ad: Ad): string {
    const postalCodePossibilities: string[] = cityList[city].postalCodePossibilities as unknown as string[]
    if (postalCodePossibilities.length === 1) {
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
    const postalCodeRe = new RegExp(cityList[city].postalCodeRegex[0])
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
  }

  protected digForPostalCode2(_city: AvailableCities, _text: string): string {
    return null
  }
}
