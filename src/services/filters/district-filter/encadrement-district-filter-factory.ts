import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { BordeauxDistrictFilter } from './district-filter-bordeaux'
import { EstEnsembleDistrictFilter } from './district-filter-est-ensemble'
import { LilleDistrictFilter } from './district-filter-lille'
import { LyonDistrictFilter } from './district-filter-lyon'
import { MontpellierDistrictFilter } from './district-filter-montpellier'
import { ParisDistrictFilter } from './district-filter-paris'
import { PlaineCommuneDistrictFilter } from './district-filter-plaine-commune'

export class DistrictFilterFactory {
  mainCity: AvailableMainCities

  constructor(mainCity: AvailableMainCities) {
    this.mainCity = mainCity
  }

  currentDistrictFilter() {
    switch (this.mainCity) {
      case 'paris':
        return ParisDistrictFilter
      case 'lille':
        return LilleDistrictFilter
      case 'plaineCommune':
        return PlaineCommuneDistrictFilter
      case 'estEnsemble':
        return EstEnsembleDistrictFilter
      case 'lyon':
        return LyonDistrictFilter
      case 'montpellier':
        return MontpellierDistrictFilter
      case 'bordeaux':
        return BordeauxDistrictFilter
    }
  }
}
