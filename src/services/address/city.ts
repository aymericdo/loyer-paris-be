import * as cleanup from '@helpers/cleanup'
import { ErrorCode } from '../api-errors'
import { Ad } from '@interfaces/ad'

type CityList = {
  [key: string]: {
    postalCodePossibilities: string[]
    postalCodeRegex: RegExp[]
  }
}

export const cityList: CityList = {
  paris: {
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
    postalCodePossibilities: ['59260'],
    postalCodeRegex: [/\b59260\b/g],
  },
  lomme: {
    postalCodePossibilities: ['59160'],
    postalCodeRegex: [/\b59160\b/g],
  },
  lille: {
    postalCodePossibilities: ['59000', '59260', '59160', '59800', '59777'],
    postalCodeRegex: [/\b59[0-9]{3}\b/g],
  },
  plaineCommune: {
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
    postalCodePossibilities: ['93300'],
    postalCodeRegex: [/\b93300\b/g],
  },
  'epinay-sur-seine': {
    postalCodePossibilities: ['93800'],
    postalCodeRegex: [/\b93800\b/g],
  },
  'ile-saint-denis': {
    postalCodePossibilities: ['93450'],
    postalCodeRegex: [/\b93450\b/g],
  },
  courneuve: {
    postalCodePossibilities: ['93120'],
    postalCodeRegex: [/\b93120\b/g],
  },
  pierrefitte: {
    postalCodePossibilities: ['93380'],
    postalCodeRegex: [/\b93380\b/g],
  },
  'saint-denis': {
    postalCodePossibilities: ['93200', '93210'],
    postalCodeRegex: [/\b(93200|93210)\b/g],
  },
  'saint-ouen': {
    postalCodePossibilities: ['93400'],
    postalCodeRegex: [/\b93400\b/g],
  },
  stains: {
    postalCodePossibilities: ['93240'],
    postalCodeRegex: [/\b93240\b/g],
  },
  villetaneuse: {
    postalCodePossibilities: ['93430'],
    postalCodeRegex: [/\b93430\b/g],
  },
  lyon: {
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
    switch (this.cityInList) {
      case 'aubervilliers':
      case 'epinay-sur-seine':
      case 'ile-saint-denis':
      case 'courneuve':
      case 'pierrefitte':
      case 'saint-denis':
      case 'saint-ouen':
      case 'stains':
      case 'villetaneuse':
        return true
      default:
        return false
    }
  }
}
