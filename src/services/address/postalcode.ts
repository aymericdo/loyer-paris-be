import { Ad } from '@interfaces/ad'
import { AvailableCities, cityList } from '@services/filters/city-filter/valid-cities-list'

export interface PostalCodeStrategy {
  getPostalCode(): string
}

export class PostalCodeStrategyFactory {
  getDiggerStrategy(city: AvailableCities, ad: Ad): PostalCodeStrategy {
    switch (city) {
      case 'paris': {
        return new ParisPostalCodeStrategy(city, ad)
      }
      case 'lyon':
      case 'villeurbanne': {
        return new LyonPostalCodeStrategy(city, ad)
      }
      default: {
        return new DefaultPostalCodeStrategy(city, ad)
      }
    }
  }
}

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

export class ParisPostalCodeStrategy extends DefaultPostalCodeStrategy {
  protected digForPostalCode2(city: AvailableCities, text: string): string {
    const postalCode2Re = new RegExp(cityList[city].postalCodeRegex[1])
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? (match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}`) : null
  }
}

export class LyonPostalCodeStrategy extends DefaultPostalCodeStrategy {
  protected digForPostalCode2(city: AvailableCities, text: string): string {
    const postalCode2Re = city === 'lyon' && new RegExp(cityList[city].postalCodeRegex[1])
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? (match.trim().length === 1 ? `6900${match.trim()}` : `690${match.trim()}`) : null
  }
}
