import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/scrap-mapping'
import fs from 'fs'
import { disconnect } from 'mongoose'
import path from 'path'
import { BienIci } from '../bienici'
import { Response } from 'express'

describe('bienici', () => {
  afterAll(async () => {
    await closeAllConnections()
    await disconnect()
  })

  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(path.resolve(__dirname, './bienici-paris-payload.json'), 'utf8')

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://www.bienici.com/annonce/location/paris-11e/appartement/2pieces/guy-hoquet-immo-facile-4938963?q=%2Frecherche%2Flocation%2Fparis-11e-75011',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const bienici = new BienIci(mockResponse, { body })

      const data = await bienici.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '75012, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 16.2 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 800 },
          charges: { order: 7, value: 30 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Quinze-Vingts' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '1' },
          surface: { order: 3, value: 16.2 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 40.4 },
          maxAuthorized: { order: 7, value: 654.48 },
          promoPercentage: { order: 8, value: 15 },
        },
        isFake: false,
        isLegal: false,
        moreInfo: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(path.resolve(__dirname, './bienici-lille-payload.json'), 'utf8')

      const body: Body = {
        id: '234523',
        data: dataLille,
        platform: 'chrome',
        url: 'https://www.bienici.com/annonce/location/paris-11e/appartement/2pieces/guy-hoquet-immo-facile-4938963?q=%2Frecherche%2Flocation%2Fparis-11e-75011',
      }

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const bienici = new BienIci(mockResponse, { body })

      const data = await bienici.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: 'allee chanteloup 59000, Lille' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 41.01 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 700 },
          charges: { order: 7, value: 90 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 4' },
          hasFurniture: { order: 1, value: false },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 41.01 },
          dateRange: { order: 4, value: 'Après 1990' },
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
