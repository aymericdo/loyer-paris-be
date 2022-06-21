import { AvailableMainCities } from '@services/address/city'
import { EstEnsembleDistrictFilter } from './est-ensemble-district'
import { LilleDistrictFilter } from './lille-district'
import { LyonDistrictFilter } from './lyon-district'
import { MontpellierDistrictFilter } from './montpellier-district'
import { ParisDistrictFilter } from './paris-district'
import { PlaineCommuneDistrictFilter } from './plaine-commune-district'

export class DistrictFilterFactory {
  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  currentFilter() {
    switch (this.city) {
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
    }
  }
}
