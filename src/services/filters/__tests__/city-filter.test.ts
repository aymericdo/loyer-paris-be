import { ERROR_CODE } from '@services/api/errors'
import { CityFilter } from '@services/filters/city-filter'
import { AvailableCities } from '@services/city-config/classic-cities'
import { closeDbConnections } from '@test-utils/website-test-harness'

afterAll(closeDbConnections)

const findCity = (text: string): AvailableCities =>
  new CityFilter(text).findCity()

describe('CityFilter.findCity — reconnaissance par inclusion', () => {
  it.each([
    ['paris', 'paris'],
    ['lyon', 'lyon'],
    ['marseille', 'marseille'],
    ['strasbourg', 'strasbourg'],
    ['bordeaux', 'bordeaux'],
    ['brest', 'brest'],
    ['villeurbanne', 'villeurbanne'],
    ['ile-saint-denis', 'ile-saint-denis'],
    ['saint-denis', 'saint-denis'],
  ])('%s → %s', (text, expected) => {
    expect(findCity(text)).toBe(expected)
  })

  it.each([
    ['Paris 75015', 'paris'],
    ['lyon 3ème', 'lyon'],
    ['Marseille 13008', 'marseille'],
    ['lille sud', 'lille'],
  ])('lit la ville dans « %s »', (text, expected) => {
    expect(findCity(text)).toBe(expected)
  })

  it('tolère le texte d’une annonce entière', () => {
    expect(findCity('appartement à louer à Paris')).toBe('paris')
  })
})

describe('CityFilter.findCity — normalisation du libellé', () => {
  it.each([
    ['BORDEAUX', 'bordeaux'],
    ['Échirolles', 'échirolles'],
    ['  Châteauneuf-Grasse  ', 'châteauneuf-grasse'],
    ['île-saint-denis', 'ile-saint-denis'],
    ['Paris, France', 'paris'],
  ])('« %s » → %s (casse et accents ignorés)', (text, expected) => {
    expect(findCity(text)).toBe(expected)
  })
})

describe('CityFilter.findCity — repli approximatif', () => {
  it.each([
    ['Marseile', 'marseille'],
    ['lyonn', 'lyon'],
  ])('rattrape la coquille « %s » → %s', (text, expected) => {
    expect(findCity(text)).toBe(expected)
  })
})

describe('CityFilter.findCity — refus', () => {
  it('refuse un libellé vide', () => {
    expect(() => findCity('')).toThrow(
      expect.objectContaining({
        error: ERROR_CODE.Address,
        msg: 'city not found',
        isIncompleteAd: true,
      }),
    )
  })

  it('refuse un libellé fait d’espaces', () => {
    expect(() => findCity('   ')).toThrow(
      expect.objectContaining({ error: ERROR_CODE.Address }),
    )
  })

  it.each(['a', 'ab', 'abc', 'zzzzzzzz', '12345', 'vvvv'])(
    'refuse un libellé inclassable « %s »',
    (text) => {
      expect(() => findCity(text)).toThrow(
        expect.objectContaining({ error: ERROR_CODE.BadLocation }),
      )
    },
  )

  it('nomme le libellé fautif dans le message', () => {
    expect(() => findCity('zzzzzzzz')).toThrow(
      expect.objectContaining({
        msg: "city 'zzzzzzzz' not found in the list",
      }),
    )
  })

  it('ne marque pas les refus de localisation comme annonce incomplète', () => {
    try {
      findCity('zzzzzzzz')
      throw new Error('aurait dû lever')
    } catch (error) {
      expect(error).not.toHaveProperty('isIncompleteAd')
    }
  })
})

// CONSTAT D'AUDIT — findCity() retient la PREMIÈRE ville de la liste dont le
// nom est une sous-chaîne du libellé. Avec 1040 villes dont beaucoup sont des
// sous-chaînes d'autres, c'est la ville la plus courte qui gagne, quel que soit
// le sens. « neuilly » passe même par Fuse et ressort « quilly ». Ces tests
// figent les faux positifs : les inverser sera le premier geste de la
// correction (comparer sur le mot entier, ou préférer la correspondance la plus
// longue).
describe('[constat] CityFilter.findCity — la sous-chaîne la plus courte gagne', () => {
  it.each([
    ['seyssinet-pariset', 'paris', 'agglo de Grenoble attribuée à Paris'],
    ['lillemer', 'lille', 'commune de Vannes attribuée à Lille'],
    ['saint-denis-sur-sarthon', 'saint-denis', 'commune d’Alençon'],
    ['aix en provence', 'vence', 'alors qu’« aix-en-provence » est en liste'],
    [
      'aix-en-provence',
      'vence',
      'la forme exacte non plus : la ville est inatteignable',
    ],
    ['bordaux', 'daux', 'coquille de « bordeaux » via la sous-chaîne « daux »'],
    ['neuilly', 'quilly', 'aucune inclusion : c’est Fuse qui se trompe'],
  ])('« %s » → %s (%s)', (text, wrongAnswer) => {
    expect(findCity(text)).toBe(wrongAnswer)
  })
})
