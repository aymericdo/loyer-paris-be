import { PostalCodeBordeaux } from '@services/diggers/postal-code/postal-code-bordeaux'
import { PostalCodeEstEnsemble } from '@services/diggers/postal-code/postal-code-est-ensemble'
import { PostalCodeLille } from '@services/diggers/postal-code/postal-code-lille'
import { PostalCodeLyon } from '@services/diggers/postal-code/postal-code-lyon'
import { PostalCodeMontpellier } from '@services/diggers/postal-code/postal-code-montpellier'
import { PostalCodeParis } from '@services/diggers/postal-code/postal-code-paris'
import { PostalCodePlaineCommune } from '@services/diggers/postal-code/postal-code-plaine-commune'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export class PostalCodeFactory {
  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  currentPostalCodeService() {
    switch (this.city) {
      case 'bordeaux': {
        return PostalCodeBordeaux
      }
      case 'estEnsemble': {
        return PostalCodeEstEnsemble
      }
      case 'lille': {
        return PostalCodeLille
      }
      case 'lyon': {
        return PostalCodeLyon
      }
      case 'montpellier': {
        return PostalCodeMontpellier
      }
      case 'paris': {
        return PostalCodeParis
      }
      case 'plaineCommune': {
        return PostalCodePlaineCommune
      }
    }
  }
}