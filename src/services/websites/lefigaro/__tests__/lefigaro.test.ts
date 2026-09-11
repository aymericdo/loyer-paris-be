import { Ad } from '@interfaces/ad'
import { Body } from '@interfaces/scrap-mapping'
import {
  closeDbConnections,
  mapAdFromFixture,
  readJsonFixture,
  ScrapingCase,
} from '@test-utils/website-test-harness'
import fs from 'fs'
import path from 'path'
import { Response } from 'express'
import { LeFigaro } from '../lefigaro'

const TEST_DIR = __dirname

const LEFIGARO_URL =
  'https://immobilier.lefigaro.fr/annonces/annonce-31231985.html'

const cases: ScrapingCase[] = [
  {
    payload: 'lefigaro-paris-payload.json',
    expected: 'lefigaro-paris-expected.json',
    city: 'paris',
    url: LEFIGARO_URL,
    capturedAt: '2025-10-14',
  },
  {
    payload: 'lefigaro-lille-payload.json',
    expected: 'lefigaro-lille-expected.json',
    city: 'lille',
    url: LEFIGARO_URL,
    capturedAt: '2025-10-14',
  },
]

// Importer un scraper charge `@db/db`, qui ouvre ses connexions Mongo dès le
// chargement du module. La fermeture reste au niveau du fichier : les tests
// E2E_LIVE plus bas ont encore besoin de la base.
afterAll(closeDbConnections)

describe('lefigaro — contrat de mapping', () => {
  describe.each(cases)('$city — $payload', (scrapingCase) => {
    it('normalise le payload brut en Ad', async () => {
      const ad = await mapAdFromFixture(LeFigaro, TEST_DIR, scrapingCase)

      expect(ad).toEqual(readJsonFixture<Ad>(TEST_DIR, scrapingCase.expected))
    })
  })
})

/**
 * Parcours complet `digData()` : géocodage (data.geopf.fr) et Mongo de
 * production. Non hermétique à dessein, donc exclu du run par défaut — c'est
 * la matière du canari nightly. Pour le lancer :
 *
 *   E2E_LIVE=1 npx jest src/services/websites/lefigaro
 */
const liveDescribe = process.env.E2E_LIVE === '1' ? describe : describe.skip

liveDescribe('lefigaro — parcours complet (E2E_LIVE)', () => {
  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(
        path.resolve(__dirname, './lefigaro-paris-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://immobilier.lefigaro.fr/annonces/annonce-31231985.html1',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const lefigaro = new LeFigaro(mockResponse, { body })

      const data = await lefigaro.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '75006, Paris' },
          hasFurniture: { order: 1, value: null },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 60 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 3300 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Notre-Dame-des-Champs' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '2' },
          surface: { order: 3, value: 60 },
          dateRange: { order: 4, value: 'Après 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 44.3 },
          maxAuthorized: { order: 7, value: 2658 },
          promoPercentage: { order: 8, value: 10.51 },
          promo: { order: 9, value: 312 },
        },
        isFake: false,
        isLegal: false,
        moreInfo:
          'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(
        path.resolve(__dirname, './lefigaro-lille-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataLille,
        platform: 'chrome',
        url: 'https://immobilier.lefigaro.fr/annonces/annonce-31231985.html1',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const lefigaro = new LeFigaro(mockResponse, { body })

      const data = await lefigaro.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: 'square dutilleul, Lille' },
          hasFurniture: { order: 1, value: null },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 91 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 2215 },
          charges: { order: 7, value: 215 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 91 },
          dateRange: { order: 4, value: 'Après 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 17.4 },
          maxAuthorized: { order: 7, value: 1583.4 },
          promoPercentage: { order: 8, value: 20.83 },
          promo: { order: 9, value: 416.6 },
        },
        isFake: false,
        isLegal: false,
        moreInfo:
          'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers',
      })
    })
  })
})
