import { AvailableMainCities } from '@services/address/city'
import { FilterEstEnsemble } from './filter-est-ensemble'
import { FilterLille } from './filter-lille'
import { FilterLyon } from './filter-lyon'
import { FilterMontpellier } from './filter-montpellier'
import { FilterParis } from './filter-paris'
import { FilterPlaineCommune } from './filter-plaine-commune'

export class EncadrementFilterFactory {
  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  currentFilterRent() {
    switch (this.city) {
      case 'paris':
        return FilterParis
      case 'lille':
        return FilterLille
      case 'plaineCommune':
        return FilterPlaineCommune
      case 'estEnsemble':
        return FilterEstEnsemble
      case 'lyon':
        return FilterLyon
      case 'montpellier':
        return FilterMontpellier
    }
  }
}
