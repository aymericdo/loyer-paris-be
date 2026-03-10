import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/scrap-mapping'
import * as fs from 'fs'
import { disconnect } from 'mongoose'
import * as path from 'path'
import { SeLoger } from '../seloger'
import { Response } from 'express'

describe('seloger', () => {
  afterAll(async () => {
    await closeAllConnections()
    await disconnect()
  })

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
        isFake: true,
        isLegal: true,
        moreInfo:
          'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
      })
    })
  })
})
