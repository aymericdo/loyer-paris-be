import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/scrap-mapping'
import fs from 'fs'
import { disconnect } from 'mongoose'
import path from 'path'
import { Orpi } from '../orpi'
import { Response } from 'express'

fdescribe('orpi', () => {
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
          address: { order: 0, value: 'rue du docteur heulin 75017, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 32.15 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1237 },
          charges: { order: 7, value: 80 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Epinettes' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '2' },
          surface: { order: 3, value: 32.15 },
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
          address: { order: 0, value: 'rue fremy, Lille' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 67 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 830 },
          charges: { order: 7, value: 30 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 4' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 67 },
          dateRange: { order: 4, value: 'Après 1990' },
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
})
