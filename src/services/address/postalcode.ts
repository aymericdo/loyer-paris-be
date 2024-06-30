import { Ad } from '@interfaces/ad'
import { AvailableCities, cityList } from './city'

export interface PostalCodeStrategy {
  getPostalCode(): string
}

export class PostalCodeStrategyFactory {
  getDiggerStrategy(city: AvailableCities, ad: Ad): PostalCodeStrategy {
    const parisStrategy = new ParisPostalCodeStrategy(city, ad)
    const lyonStrategy = new LyonPostalCodeStrategy(city, ad)
    const defaultStrategy = new DefaultPostalCodeStrategy(city, ad)
    switch (city) {
      case 'paris': {
        return parisStrategy
      }
      case 'lyon':
      case 'villeurbanne': {
        return lyonStrategy
      }
      default: {
        return defaultStrategy
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
    if (cityList[city].postalCodePossibilities.length === 1) {
      return cityList[city].postalCodePossibilities[0]
    }

    const postalCode =
      (ad.cityLabel && (this.digForPostalCode1(city, ad.cityLabel) || this.digForPostalCode2(city, ad.cityLabel))) ||
      (ad.title && (this.digForPostalCode1(city, ad.title) || this.digForPostalCode2(city, ad.title))) ||
      (ad.description &&
        (this.digForPostalCode1(city, ad.description) || this.digForPostalCode2(city, ad.description))) ||
      (cityList[city].postalCodePossibilities[0].endsWith('000') && cityList[city].postalCodePossibilities[0])

    return postalCode && cityList[city].postalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
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
