import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/mapping'
import fs from 'fs'
import { disconnect } from 'mongoose'
import path from 'path'
import { Pap } from '../pap'
import { Response } from 'express'

describe('pap', () => {
  afterAll(async () => {
    await closeAllConnections()
    await disconnect()
  })

  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(path.resolve(__dirname, './pap-paris-payload.json'), 'utf8')

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
            value: 40,
          },
          maxAuthorized: {
            order: 7,
            value: 1120,
          },
          promoPercentage: {
            order: 8,
            value: 13.85,
          },
        },
        isLegal: false,
        moreInfo: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const dataLille = fs.readFileSync(path.resolve(__dirname, './pap-lille-payload.json'), 'utf8')

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
          address: { order: 0, value: 'cite casseville 59000, Lille' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 50 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 880 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 3' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 50 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 17.5 },
          maxAuthorized: { order: 7, value: 875 },
          promoPercentage: { order: 8, value: 0.57 },
        },
        isLegal: false,
        moreInfo: 'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers',
      })
    })
  })

  describe('lyon', () => {
    test('returns clean ad', async () => {
      const dataLyon = fs.readFileSync(path.resolve(__dirname, './pap-lyon-payload.json'), 'utf8')

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
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 2' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 30 },
          dateRange: { order: 4, value: 'Après 2005' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 20.4 },
          maxAuthorized: { order: 7, value: 612 },
          promoPercentage: { order: 8, value: 17.3 },
        },
        isLegal: false,
        moreInfo: 'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
      })
    })
  })
})
