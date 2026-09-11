import { Ad } from '@interfaces/ad'
import { Body } from '@interfaces/scrap-mapping'
import {
  closeDbConnections,
  mapAdFromFixture,
  readJsonFixture,
  ScrapingCase,
} from '@test-utils/website-test-harness'
import * as fs from 'fs'
import * as path from 'path'
import { Response } from 'express'
import { SeLoger } from '../seloger'

const TEST_DIR = __dirname

const SELOGER_URL = 'https://seloger.com/dfdsfs?ad=234523'

const cases: ScrapingCase[] = [
  {
    payload: 'seloger-paris-payload.json',
    expected: 'seloger-paris-expected.json',
    city: 'paris',
    url: SELOGER_URL,
    capturedAt: '2025-10-14',
  },
  {
    payload: 'seloger-lille-payload.json',
    expected: 'seloger-lille-expected.json',
    city: 'lille',
    url: SELOGER_URL,
    capturedAt: '2025-10-14',
  },
  {
    payload: 'seloger-lyon-payload.json',
    expected: 'seloger-lyon-expected.json',
    city: 'lyon',
    url: SELOGER_URL,
    capturedAt: '2025-10-14',
  },
]

// Importer un scraper charge `@db/db`, qui ouvre ses connexions Mongo dès le
// chargement du module. La fermeture reste au niveau du fichier : les tests
// E2E_LIVE plus bas ont encore besoin de la base.
afterAll(closeDbConnections)

describe('seloger — contrat de mapping', () => {
  describe.each(cases)('$city — $payload', (scrapingCase) => {
    it('normalise le payload brut en Ad', async () => {
      const ad = await mapAdFromFixture(SeLoger, TEST_DIR, scrapingCase)

      expect(ad).toEqual(readJsonFixture<Ad>(TEST_DIR, scrapingCase.expected))
    })
  })
})

/**
 * Parcours complet `digData()` : géocodage (data.geopf.fr) et Mongo de
 * production. Non hermétique à dessein, donc exclu du run par défaut — c'est
 * la matière du canari nightly. Pour le lancer :
 *
 *   E2E_LIVE=1 npx jest src/services/websites/seloger
 */
const liveDescribe = process.env.E2E_LIVE === '1' ? describe : describe.skip

liveDescribe('seloger — parcours complet (E2E_LIVE)', () => {
  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(
        path.resolve(__dirname, './seloger-paris-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=234523',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const seloger = new SeLoger(mockResponse, { body })
      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '75018, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: null },
          surface: { order: 3, value: 32 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1250 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: "Goutte-d'Or" },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '1' },
          surface: { order: 3, value: 32 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
          promo: { order: 9, value: null },
        },
        isFake: false,
        isLegal: true,
        moreInfo:
          'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(
        path.resolve(__dirname, './seloger-lille-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataLille,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=234523',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: {
            order: 0,
            value: '59000, Lille',
          },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: null },
          surface: { order: 3, value: 75.9 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1023 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 75.9 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
          promo: { order: 9, value: null },
        },
        isFake: false,
        isLegal: true,
        moreInfo:
          'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers',
      })
    })
  })

  describe('lyon', () => {
    test('returns clean ad - lyon', async () => {
      const dataLyon = fs.readFileSync(
        path.resolve(__dirname, './seloger-lyon-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataLyon,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=234523',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '12 rue jules valensaut 69008, Lyon' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: null },
          surface: { order: 3, value: 70 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1345 },
          charges: { order: 7, value: 200 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 4' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 70 },
          dateRange: { order: 4, value: '1991-2005' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
          promo: { order: 9, value: null },
        },
        isFake: false,
        isLegal: true,
        moreInfo:
          'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
      })
    })
  })
})
