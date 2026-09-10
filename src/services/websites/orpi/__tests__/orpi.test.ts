import { Ad } from '@interfaces/ad'
import {
  closeDbConnections,
  mapAdFromFixture,
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
})
