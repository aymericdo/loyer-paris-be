import * as cleanup from '@helpers/cleanup'
import { ErrorCode } from '../api-errors'
import { Ad } from '@interfaces/ad'

type CityList = {
  [key: string]: {
    mainCity: 'paris' | 'lille' | 'plaineCommune' | 'lyon'
    postalCodePossibilities: string[]
    postalCodeRegex: RegExp[]
  }
}

export const cityList: CityList = {
  paris: {
    mainCity: 'paris',
    postalCodePossibilities: [
      '75001',
      '75002',
      '75003',
      '75004',
      '75005',
      '75006',
      '75007',
      '75008',
      '75009',
      '75010',
      '75011',
      '75012',
      '75013',
      '75014',
      '75015',
      '75016',
      '75116',
      '75017',
      '75018',
      '75019',
      '75020',
    ],
    postalCodeRegex: [
      /\b75[0-1][0-9]{2}\b/g,
      /((?<=paris )[0-9]{1,2})|([0-9]{1,2} ?(?=er|ème|e|eme))/g,
    ],
  },
  hellemmes: {
    mainCity: 'lille',
    postalCodePossibilities: ['59260'],
    postalCodeRegex: [/\b59260\b/g],
  },
  lomme: {
    mainCity: 'lille',
    postalCodePossibilities: ['59160'],
    postalCodeRegex: [/\b59160\b/g],
  },
  lille: {
    mainCity: 'lille',
    postalCodePossibilities: ['59000', '59260', '59160', '59800', '59777'],
    postalCodeRegex: [/\b59[0-9]{3}\b/g],
  },
  plaineCommune: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: [
      '93300',
      '93800',
      '93450',
      '93120',
      '93380',
      '93200',
      '93210',
      '93400',
      '93240',
      '93430',
    ],
    postalCodeRegex: [/\b93[0-9]{3}\b/g],
  },
  aubervilliers: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93300'],
    postalCodeRegex: [/\b93300\b/g],
  },
  'epinay-sur-seine': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93800'],
    postalCodeRegex: [/\b93800\b/g],
  },
  'ile-saint-denis': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93450'],
    postalCodeRegex: [/\b93450\b/g],
  },
  courneuve: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93120'],
    postalCodeRegex: [/\b93120\b/g],
  },
  pierrefitte: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93380'],
    postalCodeRegex: [/\b93380\b/g],
  },
  'saint-denis': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93200', '93210'],
    postalCodeRegex: [/\b(93200|93210)\b/g],
  },
  'saint-ouen': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93400'],
    postalCodeRegex: [/\b93400\b/g],
  },
  stains: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93240'],
    postalCodeRegex: [/\b93240\b/g],
  },
  villetaneuse: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93430'],
    postalCodeRegex: [/\b93430\b/g],
  },
  lyon: {
    mainCity: 'lyon',
    postalCodePossibilities: [
      '69001',
      '69002',
      '69003',
      '69004',
      '69005',
      '69006',
      '69007',
      '69008',
      '69009',
      '69100',
    ],
    postalCodeRegex: [
      /\b690[0-9]{2}\b/g,
      /((?<=lyon )[0-9]{1})|([0-9]{1} ?(?=er|ème|e|eme))/g,
    ],
  },
  villeurbanne: {
    mainCity: 'lyon',
    postalCodePossibilities: ['69100'],
    postalCodeRegex: [/\b69100\b/g],
  },
}

export type AvailableCities = keyof typeof cityList

export class CityService {
  cityInList: AvailableCities

  constructor(ad: Ad) {
    const cityName = cleanup.string(ad.cityLabel)

    if (!cityName || !cityName?.length) {
      throw { error: ErrorCode.Address, msg: 'city not found' }
    }

    // TODO : Fuzzy search ?
    const cityInList: AvailableCities = Object.keys(cityList).find((city) =>
      cityName.includes(city)
    )

    if (!cityInList) {
      throw {
        error: ErrorCode.City,
        msg: `[bad location]: city "${cityName}" not found in the list`,
      }
    }

    this.cityInList = cityInList as AvailableCities
  }

  findCity(): AvailableCities {
    return this.cityInList
  }

  canHaveHouse(): boolean {
    switch (cityList[this.cityInList].mainCity) {
      case 'plaineCommune':
        return true
      default:
        return false
    }
  }
}
