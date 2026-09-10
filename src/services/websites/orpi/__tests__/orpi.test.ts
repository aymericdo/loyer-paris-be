import { Ad } from '@interfaces/ad'
import { Body } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import {
  closeDbConnections,
  FixtureProvenance,
  mapAdFromFixture,
  mockExpressResponse,
  readJsonFixture,
  ScrapingCase,
} from '@test-utils/website-test-harness'
import { Orpi } from '../orpi'

const TEST_DIR = __dirname

const ORPI_URL =
  'https://www.orpi.com/annonce-location-appartement-t1-paris-11-75011-b-e1y6bt/'

const cases: ScrapingCase[] = [
  {
    payload: 'orpi-paris-payload.json',
    expected: 'orpi-paris-expected.json',
    city: 'paris',
    url: ORPI_URL,
    capturedAt: '2025-10-14',
  },
  {
    payload: 'orpi-lille-payload.json',
    expected: 'orpi-lille-expected.json',
    city: 'lille',
    url: ORPI_URL,
    capturedAt: '2025-10-14',
  },
]

describe('orpi — contrat de parsing', () => {
  // Importer un scraper charge `@db/db`, qui ouvre ses connexions Mongo.
  afterAll(closeDbConnections)

  describe.each(cases)('$city — $payload', (scrapingCase) => {
    it('normalise le payload brut en Ad', async () => {
      const ad = await mapAdFromFixture(Orpi, TEST_DIR, scrapingCase)

      expect(ad).toEqual(readJsonFixture<Ad>(TEST_DIR, scrapingCase.expected))
    })
  })

  // Gabarits servis par le site en dehors du `<main article>` habituel. Le
  // contrat visé est « ne pas planter », pas « produire des valeurs » : le
  // payload vide qui en sort est ensuite rejeté par la validation, en aval.
  const variants: FixtureProvenance[] = [
    {
      payload: 'orpi-vide-payload.json',
      city: 'paris',
      url: ORPI_URL,
      capturedAt: '2025-10-14',
      variant: 'dom-vide',
    },
  ]

  describe.each(variants)('$variant — $payload', (variantCase) => {
    it('ne plante pas et produit un Ad vide', async () => {
      const ad = await mapAdFromFixture(Orpi, TEST_DIR, variantCase)

      expect(ad).toEqual({
        id: '234523',
        charges: null,
        dpe: null,
        hasCharges: false,
        furnished: false,
        price: null,
        rooms: null,
        surface: null,
      })
    })
  })
})

describe('orpi — clauses de garde', () => {
  afterAll(closeDbConnections)

  const base: Body = {
    id: '234523',
    platform: 'chrome',
    url: ORPI_URL,
    data: '',
  }

  const map = (over: Partial<Body>) =>
    new Orpi(mockExpressResponse(), { body: { ...base, ...over } }).mapping()

  it('refuse une annonce sans identifiant', async () => {
    await expect(map({ id: undefined })).rejects.toEqual({
      error: ERROR_CODE.Minimal,
      msg: 'no more id for orpi/chrome',
    })
  })

  it('refuse une page de photos', async () => {
    await expect(map({ id: 'photos-42' })).rejects.toEqual({
      error: ERROR_CODE.Other,
      msg: 'not a rent',
    })
  })

  it('refuse une annonce déjà épuisée', async () => {
    await expect(map({ noMoreData: true })).rejects.toEqual({
      error: ERROR_CODE.Minimal,
      msg: 'no more data for orpi/chrome',
    })
  })
})
