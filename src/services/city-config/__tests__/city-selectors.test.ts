import {
  DATE_RANGE_END_IN_1990,
  DATE_RANGE_END_IN_2005,
} from '@services/helpers/year-built'
import { closeDbConnections } from '@test-utils/website-test-harness'
import { AvailableCities } from '../classic-cities'
import { AvailableMainCities } from '../main-cities'
import {
  canHaveHouse,
  coordinates,
  dateBuiltRange,
  getCities,
  getCitiesFromMainCity,
  getCityList,
  getFakeCities,
  getMainCity,
  getMainCityList,
  getRealCities,
  hasArrondissement,
  inseeCode,
  infoLink,
  isFake,
  isOnlyOneCity,
  label,
  lastDateBuiltRange,
  postalCodes,
  rentControlPeriods,
  zones,
} from '../city-selectors'

const PARIS_INFO_LINK =
  'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712'

/** Ville absente de `classic-cities.json` comme de `main-cities.json`. */
const UNKNOWN_CITY = 'atlantide' as AvailableCities
const UNKNOWN_MAIN_CITY = 'atlantide' as AvailableMainCities

describe('city-selectors — config statique des villes', () => {
  // Import transitif de `@db/db` via `year-built` : connexions à fermer.
  afterAll(closeDbConnections)

  describe('listes de villes', () => {
    it('expose toutes les main-cities', () => {
      const mainCities = getMainCityList()

      expect(mainCities).toEqual(
        expect.arrayContaining(['paris', 'lille', 'nice']),
      )
    })

    it('aplatit les cityList pour getCities()', () => {
      const cities = getCities()

      expect(cities).toEqual(
        expect.arrayContaining(['paris', 'lille', 'villeurbanne']),
      )
    })

    it("getCitiesFromMainCity renvoie une copie : muter le résultat n'affecte pas la config", () => {
      const first = getCitiesFromMainCity('lyon')
      first.push(UNKNOWN_CITY)

      expect(getCitiesFromMainCity('lyon')).toEqual(['lyon', 'villeurbanne'])
    })

    it('getCityList() renvoie toutes les villes par défaut', () => {
      expect(getCityList()).toEqual(getCities())
    })

    it('getCityList(mainCity) restreint à la main-city', () => {
      expect(getCityList('lyon')).toEqual(['lyon', 'villeurbanne'])
    })

    it('getCityList(null, city) prime sur la main-city', () => {
      expect(getCityList('lyon', 'paris')).toEqual(['paris'])
    })

    it('getMainCity remonte de la ville à sa main-city', () => {
      expect(getMainCity('villeurbanne')).toBe('lyon')
      expect(getMainCity('paris')).toBe('paris')
    })
  })

  describe('partage réel / fake', () => {
    it('distingue les main-cities réelles des fake', () => {
      expect(isFake('paris')).toBe(false)
      expect(isFake('nice')).toBe(true)
    })

    it('une main-city inconnue est traitée comme réelle (fake ?? false)', () => {
      expect(isFake(UNKNOWN_MAIN_CITY)).toBe(false)
    })

    it('le partage réel/fake est exhaustif et sans recouvrement', () => {
      const real = getRealCities()
      const fake = getFakeCities()

      expect(real.every((city) => !isFake(city))).toBe(true)
      expect(fake.every((city) => isFake(city))).toBe(true)
      expect(real.length + fake.length).toBe(getMainCityList().length)

      expect(real).toContain('paris')
      expect(fake).toContain('nice')
    })

    it('isOnlyOneCity ne vaut que pour les main-cities à ville unique', () => {
      expect(isOnlyOneCity('paris')).toBe(true)
      expect(isOnlyOneCity('lyon')).toBe(false)
    })
  })

  it('canHaveHouse ne vaut que pour les territoires ouverts à la maison', () => {
    expect(canHaveHouse('bordeaux')).toBe(true)
    expect(canHaveHouse('paris')).toBe(false)
    expect(canHaveHouse(UNKNOWN_MAIN_CITY)).toBe(false)
  })

  describe('libellés et liens', () => {
    it('label privilégie le libellé de la ville classique', () => {
      expect(label('paris')).toBe('Paris')
      expect(label('ile-saint-denis')).toBe("L'Île-Saint-Denis")
    })

    it('label retombe sur le libellé de la main-city', () => {
      expect(label('plaineCommune')).toBe('Plaine Commune')
    })

    it('label capitalise une ville inconnue plutôt que de renvoyer undefined', () => {
      expect(label(UNKNOWN_CITY)).toBe('Atlantide')
    })

    it('infoLink est absent pour les villes sans encadrement', () => {
      expect(infoLink('paris')).toBe(PARIS_INFO_LINK)
      expect(infoLink('nice')).toBeNull()
    })

    it('coordinates expose la latitude et la longitude de la main-city', () => {
      const [lat, lng] = coordinates('paris')

      expect(typeof lat).toBe('number')
      expect(typeof lng).toBe('number')
    })
  })

  describe('périodes d’encadrement', () => {
    it('les villes Lyon/Montpellier utilisent la grille jusqu’en 2005', () => {
      expect(lastDateBuiltRange('lyon')).toBe(2005)
      expect(dateBuiltRange('lyon')).toBe(DATE_RANGE_END_IN_2005)
    })

    it('les autres villes utilisent la grille jusqu’en 1990', () => {
      expect(lastDateBuiltRange('paris')).toBe(1990)
      expect(dateBuiltRange('paris')).toBe(DATE_RANGE_END_IN_1990)
    })

    it('rentControlPeriods expose les arrêtés, la période en cours sans borne de fin', () => {
      const periods = rentControlPeriods('lyon')

      expect(periods.length).toBeGreaterThan(0)
      expect(periods.at(-1)).toMatchObject({ start: expect.any(String) })
      expect(periods.at(-1).end).toBeUndefined()
    })
  })

  describe('identité administrative', () => {
    it('inseeCode renvoie le code INSEE, null si la ville est inconnue', () => {
      expect(inseeCode('paris')).toBe('75056')
      expect(inseeCode(UNKNOWN_CITY)).toBeNull()
    })

    it('hasArrondissement ne vaut que pour Paris, Lyon et Marseille', () => {
      expect(hasArrondissement('paris')).toBe(true)
      expect(hasArrondissement('lille')).toBe(false)
    })

    it('postalCodes liste les codes postaux de la ville', () => {
      expect(postalCodes('paris')).toContain('75001')
    })

    it('zones reflète la forme propre à chaque ville (liste ou par arrondissement)', () => {
      expect(zones('lille')).toEqual([
        'Zone 1',
        'Zone 2',
        'Zone 3',
        'Zone 4',
        'Zone 5',
      ])
      expect(typeof zones('paris')).toBe('object')
      expect(Array.isArray(zones('paris'))).toBe(false)
    })
  })
})
