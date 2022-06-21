import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/mapping'
import { disconnect } from 'mongoose'
import { SeLoger } from '../seloger'
import * as fs from 'fs'
import * as path from 'path'

describe('seloger', () => {
  afterAll(() => closeAllConnections())
  afterAll(() => disconnect())

  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(path.resolve(__dirname, './seloger-paris-payload.json'), 'utf8')

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=234523',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: 'rue du faubourg saint-antoine 75011, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 58 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 2600 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Sainte-Marguerite' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '3' },
          surface: { order: 3, value: 58 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 32.16 },
          maxAuthorized: { order: 7, value: 1865.28 },
          promoPercentage: { order: 8, value: 20.29 },
        },
        isLegal: false,
        moreInfo:
          'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  fdescribe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(path.resolve(__dirname, './seloger-lille-payload.json'), 'utf8')

      const body: Body = {
        id: '234523',
        data: dataLille,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=234523',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '59000, Lille' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 17 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 460 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '1' },
          surface: { order: 3, value: 17 },
          dateRange: { order: 4, value: '< 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 22.4 },
          maxAuthorized: { order: 7, value: 380.8 },
          promoPercentage: { order: 8, value: 8.02 },
        },
        isLegal: false,
        moreInfo: 'https://encadrement-loyers.lille.fr/',
      })
    })
  })

  describe('lyon', () => {
    test('returns clean ad - lyon', async () => {
      const dataLyon = fs.readFileSync(path.resolve(__dirname, './seloger-lyon-payload.json'), 'utf8')

      const body: Body = {
        id: '234523',
        data: dataLyon,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=234523',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '69003, Lyon' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 72 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1145 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '3' },
          surface: { order: 3, value: 72 },
          dateRange: { order: 4, value: 'après 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
        moreInfo:
          'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
      })
    })
  })
})
