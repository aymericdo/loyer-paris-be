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
    zones?: string[] | { [key: string]: string[] }
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
    zones: {
      1: ['Palais-Royal','Halles','St-Germain-l\'Auxerrois','Place-Vendôme'],
      2: ['Gaillon','Mail','Vivienne','Bonne-Nouvelle'],
      3: ['Enfants-Rouges','Arts-et-Metiers','Sainte-Avoie','Archives'],
      4: ['Arsenal','Saint-Gervais','Notre-Dame','Saint-Merri'],
      5: ['Saint-Victor','Val-de-Grace','Jardin-des-Plantes','Sorbonne'],
      6: ['Saint-Germain-des-Prés','Notre-Dame-des-Champs','Odeon','Monnaie'],
      7: ['Saint-Thomas-d\'Aquin','Gros-Caillou','Ecole-Militaire','Invalides'],
      8: ['Madeleine','Europe','Faubourg-du-Roule','Champs-Elysées'],
      9: ['Faubourg-Montmartre','Saint-Georges','Chaussée-d\'Antin','Rochechouart'],
      10: ['Porte-Saint-Martin','Hôpital-Saint-Louis','Saint-Vincent-de-Paul','Porte-Saint-Denis'],
      11: ['Saint-Ambroise','Roquette','Folie-Méricourt','Sainte-Marguerite'],
      12: ['Picpus','Quinze-Vingts','Bel-Air','Bercy'],
      13: ['Maison-Blanche','Salpêtrière','Gare','Croulebarbe'],
      14: ['Parc-de-Montsouris','Plaisance','Montparnasse','Petit-Montrouge'],
      15: ['Grenelle','Necker','Javel','Saint-Lambert'],
      16: ['Chaillot','Porte-Dauphine','Auteuil','Muette'],
      17: ['Epinettes','Plaine de Monceaux','Batignolles','Ternes'],
      18: ['Clignancourt','Grandes-Carrières','Goutte-d\'Or','La Chapelle'],
      19: ['Villette','Amérique','Pont-de-Flandre','Combat'],
      20: ['Charonne','Belleville','Saint-Fargeau','Père-Lachaise'],
    },
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
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
  },
  aubervilliers: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93300'],
    postalCodeRegex: [/\b93300\b/g],
    zones: ['Zone 314'],
  },
  'epinay-sur-seine': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93800'],
    postalCodeRegex: [/\b93800\b/g],
    zones: ['Zone 315'],
  },
  'ile-saint-denis': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93450'],
    postalCodeRegex: [/\b93450\b/g],
    zones: ['Zone 312'],
  },
  courneuve: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93120'],
    postalCodeRegex: [/\b93120\b/g],
    zones: ['Zone 316'],
  },
  pierrefitte: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93380'],
    postalCodeRegex: [/\b93380\b/g],
    zones: ['Zone 317'],
  },
  'saint-denis': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93200', '93210'],
    postalCodeRegex: [/\b(93200|93210)\b/g],
    zones: ['Zone 311', 'Zone 312'],
  },
  'saint-ouen': {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93400'],
    postalCodeRegex: [/\b93400\b/g],
    zones: ['Zone 310'],
  },
  stains: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93240'],
    postalCodeRegex: [/\b93240\b/g],
    zones: ['Zone 318'],
  },
  villetaneuse: {
    mainCity: 'plaineCommune',
    postalCodePossibilities: ['93430'],
    postalCodeRegex: [/\b93430\b/g],
    zones: ['Zone 316'],
  },
  lyon: {
    mainCity: 'lyon',
    postalCodePossibilities: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009', '69100'],
    postalCodeRegex: [/\b690[0-9]{2}\b/g, /((?<=lyon )[0-9]{1})|([0-9]{1} ?(?=er|ème|e|eme))/g],
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
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
    zones: ['Zone 308'],
  },
  bobigny: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93000'],
    postalCodeRegex: [/\b93000\b/g],
    zones: ['Zone 315'],
  },
  bondy: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93140'],
    postalCodeRegex: [/\b93140\b/g],
    zones: ['Zone 318'],
  },
  'le pré-saint-gervais': {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93310'],
    postalCodeRegex: [/\b93310\b/g],
    zones: ['Zone 308'],
  },
  'les lilas': {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93260'],
    postalCodeRegex: [/\b93260\b/g],
    zones: ['Zone 307'],
  },
  montreuil: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93100'],
    postalCodeRegex: [/\b93100\b/g],
    zones: ['Zone 307', 'Zone 308'],
  },
  'noisy-le-sec': {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93130'],
    postalCodeRegex: [/\b93130\b/g],
    zones: ['Zone 311'],
  },
  pantin: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93500'],
    postalCodeRegex: [/\b93500\b/g],
    zones: ['Zone 308'],
  },
  romainville: {
    mainCity: 'estEnsemble',
    postalCodePossibilities: ['93230'],
    postalCodeRegex: [/\b93230\b/g],
    zones: ['Zone 313'],
  },
  montpellier: {
    mainCity: 'montpellier',
    postalCodePossibilities: ['34000', '34070', '34080', '34090'],
    postalCodeRegex: [/\b34[0-9]{3}\b/g],
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
  },
  bordeaux: {
    mainCity: 'bordeaux',
    postalCodePossibilities: ['33000', '33300', '33800', '33100', '33200'],
    postalCodeRegex: [/\b33[0-9]{3}\b/g],
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'],
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
export type AvailableCities = keyof typeof cityList

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
      const message = `city '${cityName}' not found in the list`
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
