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
      const dataParis = fs.readFileSync(path.resolve(__dirname, './seloger-paris-payload.json'), 'utf8')

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
          address: { order: 0, value: 'rue cambaceres 75008, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: null },
          surface: { order: 3, value: 29 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1500 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Madeleine' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '1' },
          surface: { order: 3, value: 29 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 48.6 },
          maxAuthorized: { order: 7, value: 1409.4 },
          promoPercentage: { order: 8, value: 6.04 },
          promo: { order: 9, value: 90.6 },
        },
        isFake: false,
        isLegal: false,
        moreInfo: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(path.resolve(__dirname, './seloger-lille-payload.json'), 'utf8')

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
          address: { order: 0, value: '122 rue du marais de lomme 59000, Lille' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 21 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 687 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 4' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 21 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 21.6 },
          maxAuthorized: { order: 7, value: 453.6 },
          promoPercentage: { order: 8, value: 26.64 },
          promo: { order: 9, value: 164.7 },
        },
        isFake: false,
        isLegal: false,
        moreInfo: 'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers',
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

      const mockResponse: Response = {
        json: jest.fn(),
        status: jest.fn(),
      } as unknown as Response

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '24 rue lanterne 69001, Lyon' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 82 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1437 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: true },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 82 },
          dateRange: { order: 4, value: 'Après 2005' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
          promo: { order: 9, value: null },
        },
        isFake: false,
        isLegal: true,
        moreInfo: 'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
      })
    })
  })
})
