import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { FilterBordeaux } from './filter-bordeaux'
import { FilterEstEnsemble } from './filter-est-ensemble'
import { FilterLille } from './filter-lille'
import { FilterLyon } from './filter-lyon'
import { FilterMontpellier } from './filter-montpellier'
import { FilterParis } from './filter-paris'
import { FilterPlaineCommune } from './filter-plaine-commune'
import { FilterOthers } from '@services/filters/encadrement-filter/filter-others'

export class EncadrementFilterFactory {
  mainCity: AvailableMainCities

  constructor(mainCity: AvailableMainCities) {
    this.mainCity = mainCity
  }

  currentEncadrementFilter() {
    switch (this.mainCity) {
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
      case 'bordeaux':
        return FilterBordeaux
      default:
        return FilterOthers
    }
  }
}
