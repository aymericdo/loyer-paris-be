import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/scrap-mapping'
import fs from 'fs'
import { disconnect } from 'mongoose'
import path from 'path'
import { LeFigaro } from '../lefigaro'
import { Response } from 'express'

describe('lefigaro', () => {
  afterAll(async () => {
    await closeAllConnections()
    await disconnect()
  })

  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(path.resolve(__dirname, './lefigaro-paris-payload.json'), 'utf8')

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
          address: { order: 0, value: 'rue de la grande chaumiere 75006, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 55 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 2500 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Notre-Dame-des-Champs' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '2' },
          surface: { order: 3, value: 55 },
          dateRange: { order: 4, value: 'Après 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 42.1 },
          maxAuthorized: { order: 7, value: 2315.5 },
          promoPercentage: { order: 8, value: 7.38 },
        },
        isFake: false,
        isLegal: false,
        moreInfo: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(path.resolve(__dirname, './lefigaro-lille-payload.json'), 'utf8')

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
          address: { order: 0, value: '59000, Lille' },
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
          max: { order: 6, value: 16.2 },
          maxAuthorized: { order: 7, value: 1474.2 },
          promoPercentage: { order: 8, value: 26.29 },
        },
        isFake: false,
        isLegal: false,
        moreInfo: 'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers',
      })
    })
  })
})
