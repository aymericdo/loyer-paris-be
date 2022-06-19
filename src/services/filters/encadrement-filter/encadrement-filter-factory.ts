import { AvailableMainCities } from '@services/address/city'
import { EstEnsembleFilterRentService } from '../est-ensemble-filter-rent'
import { LilleFilterRentService } from '../lille-filter-rent'
import { LyonFilterRentService } from '../lyon-filter-rent'
import { MontpellierFilterRentService } from '../montpellier-filter-rent'
import { ParisFilterRentService } from '../paris-filter-rent'
import { PlaineCommuneFilterRentService } from '../plaine-commune-filter-rent'

export class FilterRentFactory {
  city: AvailableMainCities

  constructor(city: AvailableMainCities) {
    this.city = city
  }

  currentFilterRent() {
    switch (this.city) {
      case 'paris':
        return ParisFilterRentService
      case 'lille':
        return LilleFilterRentService
      case 'plaineCommune':
        return PlaineCommuneFilterRentService
      case 'estEnsemble':
        return EstEnsembleFilterRentService
      case 'lyon':
        return LyonFilterRentService
      case 'montpellier':
        return MontpellierFilterRentService
    }
  }

}
