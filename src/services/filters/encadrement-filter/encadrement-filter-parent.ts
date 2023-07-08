import { FilteredResult, InfoToFilter } from '@interfaces/ad'
import { EncadrementItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'

const CITY_FILE_PATHS = {
  paris: 'json-data/encadrements_paris.json',
  lille: 'json-data/encadrements_lille_2023.json',
  plaineCommune: 'json-data/encadrements_plaine-commune_2023.json',
  estEnsemble: 'json-data/encadrements_est-ensemble_2023.json',
  lyon: 'json-data/encadrements_lyon_2023.json',
  montpellier: 'json-data/encadrements_montpellier_2023.json',
  bordeaux: 'json-data/encadrements_bordeaux_2023.json',
}

export abstract class EncadrementFilterParent {
  infoToFilter: InfoToFilter = null
  city: AvailableMainCities
  rangeTime: string[] = ['avant 1946', '1946-1970', '1971-1990', 'apres 1990']
  universalRangeTime: [number, number][] = [[null, 1946], [1946, 1970], [1971, 1990], [1990, null]]

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  abstract filter(): FilteredResult[]

  find(): FilteredResult {
    const rentList = this.filter()

    // Get the worst case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) => (prev.maxPrice > current.maxPrice ? prev : current))
      : null

    return worstCase
  }

  rangeTimeToUniversalRangeTime(rangeTime: string): [number, number] {
    const index = this.rangeTime.indexOf(rangeTime)

    if (index === -1) {
      return null
    }

    return this.universalRangeTime[index]
  }

  @Memoize()
  protected rangeRentsJson(): EncadrementItem[] {
    return JSON.parse(fs.readFileSync(path.join(CITY_FILE_PATHS[this.city]), 'utf8'))
  }
}
