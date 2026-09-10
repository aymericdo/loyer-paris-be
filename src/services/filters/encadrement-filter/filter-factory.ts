import { InfoToFilter } from '@interfaces/ad'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FakeFilter } from '@services/filters/encadrement-filter/fake-filter'
import { GrenobleFilter } from '@services/filters/encadrement-filter/grenoble-filter'
import { EstEnsembleFilter } from './est-ensemble-filter'
import { GenericFilter } from './generic-filter'
import { ParisFilter } from './paris-filter'
import { PlaineCommuneFilter } from './plaine-commune-filter'
import { isFake } from '@services/city-config/city-selectors'

export class FilterFactory {
  mainCity: AvailableMainCities

  private filters = {
    paris: ParisFilter,
    plaineCommune: PlaineCommuneFilter,
    estEnsemble: EstEnsembleFilter,
    grenoble: GrenobleFilter,
  }

  constructor(mainCity: AvailableMainCities) {
    this.mainCity = mainCity
  }

  currentEncadrementFilter(infoToFilter: InfoToFilter) {
    const FilterClass = this.filters[this.mainCity]

    if (FilterClass) {
      return new FilterClass(infoToFilter)
    }

    if (this.mainCity === 'lyon') {
      // avoid the fake template
      return new GenericFilter(this.mainCity, infoToFilter)
    }

    return isFake(this.mainCity)
      ? new FakeFilter(this.mainCity, infoToFilter)
      : new GenericFilter(this.mainCity, infoToFilter)
  }
}
