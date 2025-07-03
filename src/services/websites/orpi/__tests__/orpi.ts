import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/scrap-mapping'
import fs from 'fs'
import { disconnect } from 'mongoose'
import path from 'path'
import { Orpi } from '../orpi'
import { Response } from 'express'

describe('orpi', () => {
  afterAll(async () => {
    await closeAllConnections()
    await disconnect()
  })

  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(
        path.resolve(__dirname, './orpi-paris-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://www.orpi.com/annonce-location-appartement-t1-paris-11-75011-b-e1y6bt/',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const orpi = new Orpi(mockResponse, { body })

      const data = await orpi.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '75019, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 10.45 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 550 },
          charges: { order: 7, value: 20 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Villette' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '1' },
          surface: { order: 3, value: 10.45 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 38.9 },
          maxAuthorized: { order: 7, value: 406.5 },
          promoPercentage: { order: 8, value: 23.3 },
          promo: { order: 9, value: 123.5 },
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
        path.resolve(__dirname, './orpi-lille-payload.json'),
        'utf8',
      )

      const body: Body = {
        id: '234523',
        data: dataLille,
        platform: 'chrome',
        url: 'https://www.orpi.com/annonce-location-appartement-t1-paris-11-75011-b-e1y6bt/',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const orpi = new Orpi(mockResponse, { body })

      const data = await orpi.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: 'boulevard vauban, Lille' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 19.6 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 525 },
          charges: { order: 7, value: 60 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 19.6 },
          dateRange: { order: 4, value: 'Après 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 19.1 },
          maxAuthorized: { order: 7, value: 374.36 },
          promoPercentage: { order: 8, value: 19.49 },
          promo: { order: 9, value: 90.64 },
        },
        isFake: false,
        isLegal: false,
        moreInfo:
          'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers',
      })
    })
  })
})
