import { AvailableMainCities } from '@services/address/city'
import { BordeauxDistrictFilter } from './bordeaux-district'
import { EstEnsembleDistrictFilter } from './est-ensemble-district'
import { LilleDistrictFilter } from './lille-district'
import { LyonDistrictFilter } from './lyon-district'
import { MontpellierDistrictFilter } from './montpellier-district'
import { ParisDistrictFilter } from './paris-district'
import { PlaineCommuneDistrictFilter } from './plaine-commune-district'

export class DistrictFilterFactory {
  mainCity: AvailableMainCities

  constructor(mainCity: AvailableMainCities) {
    this.mainCity = mainCity
  }

  currentFilter() {
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
