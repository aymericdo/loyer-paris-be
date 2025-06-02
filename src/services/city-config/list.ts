import { isFake } from '@services/city-config/fake'

const CITIES = {
  paris: ['paris'],
  lille: ['lille'],
  plaineCommune: [
    'aubervilliers',
    'epinay-sur-seine',
    'ile-saint-denis',
    'courneuve',
    'pierrefitte-sur-seine',
    'saint-denis',
    'saint-ouen',
    'stains',
    'villetaneuse',
  ],
  lyon: ['lyon', 'villeurbanne'],
  estEnsemble: [
    'bagnolet',
    'bobigny',
    'bondy',
    'le pré-saint-gervais',
    'les lilas',
    'montreuil',
    'noisy-le-sec',
    'pantin',
    'romainville',
  ],
  bordeaux: ['bordeaux'],
  montpellier: ['montpellier'],
  'la rochelle': ['la rochelle'],
  'annecy': ['annecy'],
  'marseille': ['marseille'],
  'nice': ['nice'],
  'nantes': ['nantes'],
  'strasbourg': ['strasbourg'],
  'rennes': ['rennes'],
  'toulon': ['toulon'],
  'toulouse': ['toulouse'],
  'aix-en-provence': ['aix-en-provence'],
  paysBasque: [
    'ahetze',
    'anglet',
    'arbonne',
    'arcangues',
    'ascain',
    'bassussarry',
    'bayonne',
    'biarritz',
    'bidart',
    'biriatou',
    'boucau',
    'ciboure',
    'guéthary',
    'hendaye',
    'jatxou',
    'lahonce',
    'larressore',
    'mouguerre',
    'saint-jean-de-luz',
    'saint-pierre-d\'irube',
    'urcuit',
    'urrugne',
    'ustaritz',
    'villefranque',
  ],
  grenoble: [
    'bresson',
    'claix',
    'domène',
    'échirolles',
    'eybens',
    'fontaine',
    'fontanil-cornillon',
    'gières',
    'grenoble',
    'la tronche',
    'le pont-de-claix',
    'meylan',
    'murianette',
    'poisat',
    'saint-égrève',
    'saint-martin-d\'hères',
    'sassenage',
    'seyssinet-pariset',
    'seyssins',
    'varces-allières-et-risset',
    'venon'
  ],
} as const

export type AvailableMainCities = keyof typeof CITIES
export type AvailableCities = typeof CITIES[AvailableMainCities][number]
export type AvailableCityZones = string[] | { [key: string]: string[] }

export const mainCityList: AvailableMainCities[] = Object.keys(CITIES) as AvailableMainCities[]
export const cityList: AvailableCities[] = mainCityList.reduce((prev, mainCity) => {
  prev = prev.concat(CITIES[mainCity])
  return prev
}, [])
export const fakeCities = mainCityList.filter((mainCity) => isFake(mainCity))

export const getCityList = (mainCity: AvailableMainCities = null, city: AvailableCities = null): AvailableCities[] =>
  city ? [city] : mainCity ? getCitiesFromMainCity(mainCity) : [...cityList]
export const getMainCity = (city: AvailableCities): AvailableMainCities => mainCityList.find((mainCity) => getCitiesFromMainCity(mainCity).includes(city))
export const getCitiesFromMainCity = (mainCity: AvailableMainCities): AvailableCities[] => [...CITIES[mainCity]] as AvailableCities[]
