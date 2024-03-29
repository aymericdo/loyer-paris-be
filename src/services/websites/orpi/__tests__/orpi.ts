import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/mapping'
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
      const dataParis = fs.readFileSync(path.resolve(__dirname, './orpi-paris-payload.json'), 'utf8')

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
          address: { order: 0, value: '75013, Paris' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 33.3 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1218 },
          charges: { order: 7, value: 112 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Croulebarbe' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: '2' },
          surface: { order: 3, value: 33.3 },
          dateRange: { order: 4, value: 'Après 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 32 },
          maxAuthorized: { order: 7, value: 1065.6 },
          promoPercentage: { order: 8, value: 3.65 },
        },
        isLegal: false,
        moreInfo: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(path.resolve(__dirname, './orpi-lille-payload.json'), 'utf8')

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
          address: { order: 0, value: '59000, Lille' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 67.65 },
          yearBuilt: { order: 4, value: '1914' },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 900 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 67.65 },
          dateRange: { order: 4, value: 'avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
        moreInfo: 'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers',
      })
    })
  })
})
