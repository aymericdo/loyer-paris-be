import { closeAllConnections } from '@db/db'
import { Body } from '@interfaces/mapping'
import { disconnect } from 'mongoose'
import fs from 'fs'
import path from 'path'
import { Pap } from '../pap'

describe('pap', () => {
  afterAll(() => closeAllConnections())
  afterAll(() => disconnect())

  describe('paris', () => {
    test('returns clean ad', async () => {
      const dataParis = fs.readFileSync(path.resolve(__dirname, './pap-paris-payload.json'), 'utf8')

      const body: Body = {
        id: '234523',
        data: dataParis,
        platform: 'chrome',
        url: 'https://pap.fr/lkdfsklnf?r421900951',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const pap = new Pap(mockResponse, { body })

      const data = await pap.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: {
            order: 0,
            value: 'rue de rivoli 75001, Paris',
          },
          hasFurniture: {
            order: 1,
            value: true,
          },
          roomCount: {
            order: 2,
            value: 1,
          },
          surface: {
            order: 3,
            value: 12,
          },
          yearBuilt: {
            order: 4,
            value: null,
          },
          isHouse: { order: 5, value: null },
          price: {
            order: 6,
            value: 750,
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
            value: 'Place-Vendôme',
          },
          hasFurniture: {
            order: 1,
            value: true,
          },
          roomCount: {
            order: 2,
            value: '1',
          },
          surface: {
            order: 3,
            value: 12,
          },
          dateRange: {
            order: 4,
            value: 'Avant 1946',
          },
          isHouse: { order: 5, value: undefined },
          max: {
            order: 6,
            value: 45.1,
          },
          maxAuthorized: {
            order: 7,
            value: 541.2,
          },
          promoPercentage: {
            order: 8,
            value: 27.84,
          },
        },
        isLegal: false,
        moreInfo:
          'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
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

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const pap = new Pap(mockResponse, { body })

      const data = await pap.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '59000, Lille' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 90 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1265 },
          charges: { order: 7, value: 196 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '3' },
          surface: { order: 3, value: 90 },
          dateRange: { order: 4, value: '> 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
        moreInfo: 'https://encadrement-loyers.lille.fr/',
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

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const pap = new Pap(mockResponse, { body })

      const data = await pap.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: {
            order: 0,
            value: '69005, Lyon',
          },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 34 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 990 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '1' },
          surface: { order: 3, value: 34 },
          dateRange: { order: 4, value: 'après 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 22.9 },
          maxAuthorized: { order: 7, value: 778.6 },
          promoPercentage: { order: 8, value: 21.35 },
        },
        isLegal: false,
        moreInfo:
          'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
      })
    })
  })
})
