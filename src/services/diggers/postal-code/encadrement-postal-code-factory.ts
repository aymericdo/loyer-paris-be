import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'
import { PostalCodeLyon } from '@services/diggers/postal-code/postal-code-lyon'
import { PostalCodeParis } from '@services/diggers/postal-code/postal-code-paris'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export class PostalCodeFactory {
  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  currentPostalCodeService() {
    switch (this.city) {
      case 'lyon': {
        return PostalCodeLyon
      }
      case 'paris': {
        return PostalCodeParis
      }
      default: {
        return PostalCodeDefault
      }
    }
  }
}