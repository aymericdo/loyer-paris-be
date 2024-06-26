import { Ad } from '@interfaces/ad'
import { Slack } from '@messenger/slack'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { PrettyLog } from '@services/helpers/pretty-log'

type CityList = {
  [key: string]: {
    mainCity: AvailableMainCities
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
    postalCodeRegex: [/\b75[0-1][0-9]{2}\b/g, /((?<=paris )[0-9]{1,2})|([0-9]{1,2} ?(?=er|ème|e|eme))/g],
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
    postalCodePossibilities: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009', '69100'],
    postalCodeRegex: [/\b690[0-9]{2}\b/g, /((?<=lyon )[0-9]{1})|([0-9]{1} ?(?=er|ème|e|eme))/g],
  },
  villeurbanne: {
    mainCity: 'lyon',
    postalCodePossibilities: ['69100'],
    postalCodeRegex: [/\b69100\b/g],
  },
  bagnolet: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93170'],
    postalCodeRegex: [/\b93170\b/g],
  },
  bobigny: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93000'],
    postalCodeRegex: [/\b93000\b/g],
  },
  bondy: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93140'],
    postalCodeRegex: [/\b93140\b/g],
  },
  'le pré-saint-gervais': {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93310'],
    postalCodeRegex: [/\b93310\b/g],
  },
  'les lilas': {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93260'],
    postalCodeRegex: [/\b93260\b/g],
  },
  montreuil: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93100'],
    postalCodeRegex: [/\b93100\b/g],
  },
  'noisy-le-sec': {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93130'],
    postalCodeRegex: [/\b93130\b/g],
  },
  pantin: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93500'],
    postalCodeRegex: [/\b93500\b/g],
  },
  romainville: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93230'],
    postalCodeRegex: [/\b93230\b/g],
  },
  montpellier: {
    mainCity: 'montpellier',
    postalCodePossibilities: ['34000', '34070', '34080', '34090'],
    postalCodeRegex: [/\b34[0-9]{3}\b/g],
  },
  bordeaux: {
    mainCity: 'bordeaux',
    postalCodePossibilities: ['33000', '33300', '33800', '33100', '33200'],
    postalCodeRegex: [/\b33[0-9]{3}\b/g],
  },
}

export type AvailableMainCities =
  | 'paris'
  | 'lille'
  | 'plaineCommune'
  | 'lyon'
  | 'estEnsemble'
  | 'montpellier'
  | 'bordeaux'
export type AvailableCities = keyof typeof cityList & string

export const mainCityList: AvailableMainCities[] = Object.values(cityList).map((city) => city.mainCity)

export class CityService {
  cityInList: AvailableCities

  constructor(ad: Ad) {
    const cityName = cleanup.string(ad.cityLabel)

    if (!cityName || !cityName?.length) {
      throw {
        error: ERROR_CODE.Address,
        msg: 'city not found',
        isIncompleteAd: true,
      }
    }

    const cityInList: AvailableCities = Object.keys(cityList).find((city) => cityName.includes(city))

    if (!cityInList) {
      const message = `city "${cityName}" not found in the list`
      PrettyLog.call(message, 'yellow')
      new Slack().sendMessage('#bad-location', message)

      throw {
        error: ERROR_CODE.City,
        msg: 'city not found in the list',
      }
    }

    this.cityInList = cityInList as AvailableCities
  }

  findCity(): AvailableCities {
    return this.cityInList
  }

  static findCityWithPostalCode(postalCode: string): AvailableCities {
    return Object.keys(cityList).find((city) => cityList[city].postalCodePossibilities.includes(postalCode))
  }

  static canHaveHouse(city: AvailableMainCities): boolean {
    // https://www.youtube.com/watch?v=TuxMwALL_S4&ab_channel=Charted
    switch (city) {
      case 'plaineCommune':
      case 'estEnsemble':
      case 'bordeaux':
        return true
      default:
        return false
    }
  }
}
