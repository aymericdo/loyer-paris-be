import { FilteredResult } from '@interfaces/ad'
import { AvailableCities } from '@services/city-config/classic-cities'
import { closeDbConnections } from '@test-utils/website-test-harness'
import { SerializedInfo, SerializerService } from '../serializer'

/**
 * Contrat de sortie vers les extensions navigateur.
 *
 * `serialize()` est pur : ses dépendances (`city-selectors`, `round-number`,
 * `year-built`) lisent une config statique et ne touchent ni la base ni le
 * réseau. Aucun double n'est donc nécessaire — mocker ici ne testerait que le
 * mock. Seul l'import transitif de `@db/db` (via `year-built`) impose la
 * fermeture des connexions en fin de suite.
 */
const PARIS_INFO_LINK =
  'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712'

const serializedInfo = (
  overrides: Partial<SerializedInfo> = {},
): SerializedInfo => ({
  address: '12 rue des Lilas',
  charges: 80,
  city: 'paris' as AvailableCities,
  hasCharges: true,
  hasFurniture: true,
  isHouse: false,
  isLegal: false,
  maxAuthorized: 1000,
  postalCode: '75017',
  price: 1237.456,
  priceExcludingCharges: 1157.456,
  roomCount: 2,
  surface: 32.15,
  yearBuilt: [1971, 1990],
  ...overrides,
})

const filteredResult = (
  overrides: Partial<FilteredResult> = {},
): FilteredResult => ({
  districtName: 'Quartier Guy Moquet',
  isFurnished: true,
  isHouse: null,
  maxPrice: 1100,
  minPrice: 900,
  refPrice: 1050,
  roomCount: '2',
  yearBuilt: '1971-1990',
  ...overrides,
})

const serialize = (
  info: Partial<SerializedInfo> = {},
  filtered: Partial<FilteredResult> = {},
) =>
  new SerializerService(
    serializedInfo(info),
    filteredResult(filtered),
  ).serialize()

describe('SerializerService — contrat de sortie des extensions', () => {
  afterAll(closeDbConnections)

  it('produit le contrat complet attendu par les extensions (paris, loyer hors encadrement)', () => {
    expect(serialize()).toEqual({
      detectedInfo: {
        address: { order: 0, value: '12 rue des Lilas 75017, Paris' },
        hasFurniture: { order: 1, value: true },
        roomCount: { order: 2, value: 2 },
        surface: { order: 3, value: 32.15 },
        yearBuilt: { order: 4, value: '1971-1990' },
        isHouse: { order: 5, value: null },
        price: { order: 6, value: 1237.46 },
        charges: { order: 7, value: 80 },
        hasCharges: { order: 8, value: null },
      },
      computedInfo: {
        neighborhood: { order: 0, value: 'Quartier Guy Moquet' },
        hasFurniture: { order: 1, value: true },
        roomCount: { order: 2, value: '2' },
        surface: { order: 3, value: 32.15 },
        dateRange: { order: 4, value: '1971-1990' },
        isHouse: { order: 5, value: null },
        max: { order: 6, value: 1100 },
        maxAuthorized: { order: 7, value: 1000 },
        promoPercentage: { order: 8, value: 13.6 },
        promo: { order: 9, value: 157.46 },
      },
      isLegal: false,
      isFake: false,
      moreInfo: PARIS_INFO_LINK,
    })
  })

  describe('adresse détectée — les 4 combinaisons address/postalCode', () => {
    it.each<[string, string | undefined, string]>([
      ['12 rue des Lilas', '75017', '12 rue des Lilas 75017, Paris'],
      ['12 rue des Lilas', undefined, '12 rue des Lilas, Paris'],
      [undefined, '75017', '75017, Paris'],
      [undefined, undefined, 'Paris'],
    ])('address=%p postalCode=%p → %p', (address, postalCode, expected) => {
      const { detectedInfo } = serialize({ address, postalCode })

      expect(detectedInfo.address.value).toBe(expected)
    })
  })

  describe('hasCharges — n’est renseigné que si le montant est inconnu', () => {
    it('reprend hasCharges quand charges est absent', () => {
      const { detectedInfo } = serialize({
        charges: undefined,
        hasCharges: true,
      })

      expect(detectedInfo.hasCharges.value).toBe(true)
    })

    it('reprend hasCharges=false quand charges est absent', () => {
      const { detectedInfo } = serialize({
        charges: undefined,
        hasCharges: false,
      })

      expect(detectedInfo.hasCharges.value).toBe(false)
    })

    it('renvoie null quand hasCharges est inconnu', () => {
      const { detectedInfo } = serialize({
        charges: undefined,
        hasCharges: null,
      })

      expect(detectedInfo.hasCharges.value).toBeNull()
    })

    it('renvoie null quand le montant est connu (le montant prime)', () => {
      const { detectedInfo } = serialize({ charges: 80, hasCharges: true })

      expect(detectedInfo.hasCharges.value).toBeNull()
    })
  })

  describe('année de construction affichée', () => {
    it.each<[string, number[] | undefined, string]>([
      ['inconnue', undefined, null],
      ['avant borne', [null, 1970], 'Avant 1970'],
      ['après borne', [1971, null], 'Après 1971'],
      ['période', [1971, 1990], '1971-1990'],
      ['année seule', [1971], '1971'],
    ])('%s → %p', (_label, yearBuilt, expected) => {
      const { detectedInfo } = serialize({ yearBuilt })

      expect(detectedInfo.yearBuilt.value).toBe(expected)
    })
  })

  it('marque une maison comme « Maison », sinon null', () => {
    expect(serialize({ isHouse: true }).detectedInfo.isHouse.value).toBe(
      'Maison',
    )
    expect(serialize({ isHouse: false }).detectedInfo.isHouse.value).toBeNull()
  })

  describe('quand le loyer est légal, aucun encouragement à la baisse', () => {
    it('nullifie max, maxAuthorized, promoPercentage et promo', () => {
      const { computedInfo } = serialize({ isLegal: true })

      expect(computedInfo.max.value).toBeNull()
      expect(computedInfo.maxAuthorized.value).toBeNull()
      expect(computedInfo.promoPercentage.value).toBeNull()
      expect(computedInfo.promo.value).toBeNull()
    })

    it('conserve isLegal=true au niveau racine', () => {
      expect(serialize({ isLegal: true }).isLegal).toBe(true)
    })
  })

  describe('ville sans encadrement (fake)', () => {
    it('signale isFake et n’expose aucun lien d’information', () => {
      const result = serialize({ city: 'nice' as AvailableCities })

      expect(result.isFake).toBe(true)
      expect(result.moreInfo).toBeNull()
    })
  })
})
