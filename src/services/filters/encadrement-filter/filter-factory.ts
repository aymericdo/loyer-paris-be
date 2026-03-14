import { InfoToFilter } from '@interfaces/ad'
import {
  AvailableMainCities,
  RentControlPeriod,
} from '@services/city-config/main-cities'
import { FakeFilter } from '@services/filters/encadrement-filter/fake-filter'
import { GrenobleFilter } from '@services/filters/encadrement-filter/grenoble-filter'
import { EstEnsembleFilter } from './est-ensemble-filter'
import { GenericFilter } from './generic-filter'
import { ParisFilter } from './paris-filter'
import { PlaineCommuneFilter } from './plaine-commune-filter'
import {
  isFake,
  rentControlPeriods,
} from '@services/city-config/city-selectors'

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

  static getJsonPath(city: AvailableMainCities, date: Date | null): string {
    const periods = rentControlPeriods(city)

    if (!periods?.length) {
      throw `There is no criteria data for ${city}`
    }

    if (date) {
      return FilterFactory.getJsonPathForDate(periods, date)
    }

    return `json-data/${periods[periods.length - 1].file}`
  }

  static getJsonPathForDate(periods: RentControlPeriod[], date: Date): string {
    if (periods.length === 1) {
      return `json-data/${periods[0].file}`
    }

    const matchingPeriod = periods.find((p) => {
      if (!p.start || !p.end) return false
      return date >= new Date(p.start) && date <= new Date(p.end)
    })

    if (!matchingPeriod) {
      return `json-data/${periods[periods.length - 1].file}`
    }

    return `json-data/${matchingPeriod.file}`
  }
}
