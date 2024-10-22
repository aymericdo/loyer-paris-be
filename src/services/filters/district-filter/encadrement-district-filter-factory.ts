import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterBordeaux } from './district-filter-bordeaux'
import { DistrictFilterEstEnsemble } from './district-filter-est-ensemble'
import { DistrictFilterLille } from './district-filter-lille'
import { DistrictFilterLyon } from './district-filter-lyon'
import { DistrictFilterMontpellier } from './district-filter-montpellier'
import { DistrictFilterParis } from './district-filter-paris'
import { DistrictFilterPlaineCommune } from './district-filter-plaine-commune'
import { DistrictFilterPaysBasque } from '@services/filters/district-filter/district-filter-pays-basque'

export class DistrictFilterFactory {
  mainCity: AvailableMainCities

  constructor(mainCity: AvailableMainCities) {
    this.mainCity = mainCity
  }

  currentDistrictFilter() {
    switch (this.mainCity) {
      case 'paris':
        return DistrictFilterParis
      case 'lille':
        return DistrictFilterLille
      case 'plaineCommune':
        return DistrictFilterPlaineCommune
      case 'estEnsemble':
        return DistrictFilterEstEnsemble
      case 'lyon':
        return DistrictFilterLyon
      case 'montpellier':
        return DistrictFilterMontpellier
      case 'bordeaux':
        return DistrictFilterBordeaux
      case 'paysBasque':
        return DistrictFilterPaysBasque
    }
  }
}
