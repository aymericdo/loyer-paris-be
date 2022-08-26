import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { EncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'

const CITY_FILE_PATHS = {
  paris: 'json-data/encadrements_paris.json',
  lille: 'json-data/encadrements_lille.json',
  plaineCommune: 'json-data/encadrements_plaine-commune.json',
  estEnsemble: 'json-data/encadrements_est-ensemble.json',
  lyon: 'json-data/encadrements_lyon.json',
  montpellier: 'json-data/encadrements_montpellier.json',
  bordeaux: 'json-data/encadrements_bordeaux.json',
}

export abstract class EncadrementFilterParent {
  infoToFilter: InfoToFilter = null
  city: AvailableMainCities

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  abstract filter(): FilteredResult[]

  find(): FilteredResult {
    const rentList = this.filter()

    // Get the worst case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) =>
        prev.maxPrice > current.maxPrice ? prev : current
      )
      : null

    return worstCase
  }

  @Memoize()
  protected rangeRentsJson(): EncadrementItem[] {
    return JSON.parse(
      fs.readFileSync(path.join(CITY_FILE_PATHS[this.city]), 'utf8')
    )
  }
}
