import { Body } from '@interfaces/mapping'
import { LeFigaro } from '../lefigaro'
import { disconnect } from 'mongoose'
import { closeAllConnections } from '@db/db'
import fs from 'fs'
import path from 'path'

describe('lefigaro', () => {
  afterAll(() => closeAllConnections())
  afterAll(() => disconnect())

  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(path.resolve(__dirname, './lefigaro-paris-payload.json'), 'utf8')

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://immobilier.lefigaro.fr/annonces/annonce-31231985.html1',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

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
          max: { order: 6, value: 40.32 },
          maxAuthorized: { order: 7, value: 2217.6 },
          promoPercentage: { order: 8, value: 11.3 },
        },
        isLegal: false,
        moreInfo:
          'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
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

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

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
          neighborhood: { order: 0, value: 'Zone 4' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '3' },
          surface: { order: 3, value: 91 },
          dateRange: { order: 4, value: '> 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 13.3 },
          maxAuthorized: { order: 7, value: 1210.3 },
          promoPercentage: { order: 8, value: 39.48 },
        },
        isLegal: false,
        moreInfo: 'https://encadrement-loyers.lille.fr/',
      })
    })
  })
})
