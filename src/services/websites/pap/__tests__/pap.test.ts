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
import { Pap } from '../pap'

const TEST_DIR = __dirname

const PAP_URL = 'https://pap.fr/lkdfsklnf?r421900951'

const cases: ScrapingCase[] = [
  {
    payload: 'pap-paris-payload.json',
    expected: 'pap-paris-expected.json',
    city: 'paris',
    url: PAP_URL,
    capturedAt: '2025-10-14',
  },
  {
    payload: 'pap-lille-payload.json',
    expected: 'pap-lille-expected.json',
    city: 'lille',
    url: PAP_URL,
    capturedAt: '2025-10-14',
  },
  {
    payload: 'pap-lyon-payload.json',
    expected: 'pap-lyon-expected.json',
    city: 'lyon',
    url: PAP_URL,
    capturedAt: '2025-10-14',
  },
]

// Importer un scraper charge `@db/db`, qui ouvre ses connexions Mongo dès le
// chargement du module. La fermeture reste au niveau du fichier : les tests
// E2E_LIVE plus bas ont encore besoin de la base.
afterAll(closeDbConnections)

describe('pap — contrat de mapping', () => {
  describe.each(cases)('$city — $payload', (scrapingCase) => {
    it('normalise le payload brut en Ad', async () => {
      const ad = await mapAdFromFixture(Pap, TEST_DIR, scrapingCase)

      expect(ad).toEqual(readJsonFixture<Ad>(TEST_DIR, scrapingCase.expected))
    })
  })
})

/**
 * Parcours complet `digData()` : géocodage (data.geopf.fr) et Mongo de
 * production. Non hermétique à dessein, donc exclu du run par défaut — c'est
 * la matière du canari nightly. Pour le lancer :
 *
 *   E2E_LIVE=1 npx jest src/services/websites/pap
 */
const liveDescribe = process.env.E2E_LIVE === '1' ? describe : describe.skip

liveDescribe('pap — parcours complet (E2E_LIVE)', () => {
  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(
        path.resolve(__dirname, './pap-paris-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://pap.fr/lkdfsklnf?r421900951',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const pap = new Pap(mockResponse, { body })

      const data = await pap.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: {
            order: 0,
            value: '75005, Paris',
          },
          hasFurniture: {
            order: 1,
            value: true,
          },
          roomCount: {
            order: 2,
            value: 2,
          },
          surface: {
            order: 3,
            value: 28,
          },
          yearBuilt: {
            order: 4,
            value: null,
          },
          isHouse: { order: 5, value: null },
          price: {
            order: 6,
            value: 1300,
          },
          charges: {
            order: 7,
            value: null,
          },
          hasCharges: {
            order: 8,
            value: null,
          },
        },
        computedInfo: {
          neighborhood: {
            order: 0,
            value: 'Saint-Victor',
          },
          hasFurniture: {
            order: 1,
            value: true,
          },
          roomCount: {
            order: 2,
            value: '2',
          },
          surface: {
            order: 3,
            value: 28,
          },
          dateRange: {
            order: 4,
            value: 'Avant 1946',
          },
          isHouse: { order: 5, value: undefined },
          max: {
            order: 6,
            value: 42.6,
          },
          maxAuthorized: {
            order: 7,
            value: 1192.8,
          },
          promoPercentage: {
            order: 8,
            value: 8.25,
          },
          promo: {
            order: 9,
            value: 107.2,
          },
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
        path.resolve(__dirname, './pap-lille-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataLille,
        platform: 'chrome',
        url: 'https://pap.fr/lkdfsklnf?r421900951',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const pap = new Pap(mockResponse, { body })

      const data = await pap.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: 'cite menu 59000, Lille' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 50 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 880 },
          charges: { order: 7, value: 80 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 3' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 50 },
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
    test('returns clean ad', async () => {
      const dataLyon = fs.readFileSync(
        path.resolve(__dirname, './pap-lyon-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataLyon,
        platform: 'chrome',
        url: 'https://pap.fr/lkdfsklnf?r421900951',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const pap = new Pap(mockResponse, { body })

      const data = await pap.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: {
            order: 0,
            value: '69100, Villeurbanne',
          },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 30 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 740 },
          charges: { order: 7, value: 70 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 2' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 30 },
          dateRange: { order: 4, value: 'Après 2005' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 20.5 },
          maxAuthorized: { order: 7, value: 615 },
          promoPercentage: { order: 8, value: 8.21 },
          promo: { order: 9, value: 55 },
        },
        isFake: false,
        isLegal: false,
        moreInfo:
          'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
      })
    })
  })
})
