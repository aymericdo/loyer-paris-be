import { Ad } from '@interfaces/ad'
import { DefaultPostalCodeStrategy } from '@services/diggers/postal-code/postal-code-default'
import { LyonPostalCodeStrategy } from '@services/diggers/postal-code/postal-code-lyon'
import { ParisPostalCodeStrategy } from '@services/diggers/postal-code/postal-code-paris'
import { AvailableCities } from '@services/filters/city-filter/valid-cities-list'

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