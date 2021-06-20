jest.useFakeTimers()

import { Mapping } from '@interfaces/mapping'
import { BienIci } from '../bienici'
const mongoose = require('mongoose')

describe('bienici', () => {
  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('paris', () => {
    test('returns clean ad', async (done) => {
      try {
        const body: Mapping = {
          id: 'guy-hoquet-immo-facile-4938963',
          cityLabel: 'paris 11e 75011 (nation - alexandre dumas)',
          description:
            "descriptif de cet appartement a louer de 2 pieces et 33 m²appartement paris 11 - 2 pieces 33 m2. superbe appartement de 33 m2 meuble, au 3eme etage sans ascenseur d'un immeuble rue voltaire paris 11. il se compose d'une entree, un sejour, une cuisine amenagee equipee, une chambre et une salle d'eau avec wc + cave. l'appartement vient d'etre renove.disponible de suite.lire plus",
          furnished: true,
          price: '1250',
          renter: null,
          rooms: '2',
          hasCharges: true,
          charges: '110',
          surface: '33',
          title:
            'location appartement meuble 2 pieces 33 m²paris 11e 75011 (nation - alexandre dumas)',
          platform: 'chrome',
          url: 'https://www.bienici.com/annonce/location/paris-11e/appartement/2pieces/guy-hoquet-immo-facile-4938963?q=%2Frecherche%2Flocation%2Fparis-11e-75011',
        }

        const mockResponse: any = {
          json: jest.fn(),
          status: jest.fn(),
        }

        const bienici = new BienIci(mockResponse, { body })

        const data = await bienici.digData()

        expect(data).toEqual({
          detectedInfo: {
            address: { order: 0, value: 'rue voltaire 75011, Paris' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 2 },
            surface: { order: 3, value: 33 },
            yearBuilt: { order: 4, value: null },
            isHouse: { order: 5, value: null },
            price: { order: 6, value: 1250 },
            charges: { order: 7, value: 110 },
            hasCharges: { order: 8, value: null },
          },
          computedInfo: {
            neighborhood: { order: 0, value: 'Roquette' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 2 },
            surface: { order: 3, value: 33 },
            dateRange: { order: 4, value: 'Avant 1946' },
            isHouse: { order: 5, value: undefined },
            max: { order: 6, value: 32.76 },
            maxAuthorized: { order: 7, value: 1081.08 },
            promoPercentage: { order: 8, value: 5.17 },
          },
          isLegal: false,
        })

        done()
      } catch (e) {
        done.fail(e)
      }
    })
  })

  describe('lille', () => {
    test('returns clean ad', async (done) => {
      try {
        const body: Mapping = {
          id: 'gedeon-22869488',
          cityLabel: 'lille 59000 (bois blanc)',
          description:
            "descriptif de cet appartement a louer de 1 piece et 10 m²location appartement 10 m² a lille 563 € cc /mois. colocation dans un appartement meuble et entierement renove disponible a partir du 8 juin 2021. situe au dernier etage avec ascenseur. l'appartement est equipe d'une nouvelle cuisine avec plaque induction, four a micro-ondes, four a chaleur tournante et un refrigerateur avec congelateur. egalement equipe d'un lave vaisselle encastrable, d'une machine a laver, d'une nespresso et autres ustensiles propice a une cuisine. le logement est idealement situe a 2 minutes a pied du metro 'bois blanc' ainsi qu'un carrefour express, d'une boulangerie et d'un magasin bio ou pied de l'immeuble : ) les charges comprennent l'eau, le chauffage, edf, internet illimite, netflix, rmc sport… a. p.l accordees. pas de frais d'agence.lire plus",
          furnished: true,
          price: '563',
          renter: null,
          rooms: '1',
          hasCharges: true,
          charges: '83',
          surface: '10',
          title:
            'location appartement meuble 1 piece 10 m²lille 59000 (bois blanc)',
          platform: 'chrome',
          url: 'https://www.bienici.com/annonce/location/lille/appartement/1piece/gedeon-22869488?q=%2Frecherche%2Flocation%2Flille-59000%3Fprix-max%3D800',
        }

        const mockResponse: any = {
          json: jest.fn(),
          status: jest.fn(),
        }

        const bienici = new BienIci(mockResponse, { body })

        const data = await bienici.digData()

        expect(data).toEqual({
          detectedInfo: {
            address: { order: 0, value: '59000, Lille' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 1 },
            surface: { order: 3, value: 10 },
            yearBuilt: { order: 4, value: null },
            isHouse: { order: 5, value: null },
            price: { order: 6, value: 563 },
            charges: { order: 7, value: 83 },
            hasCharges: { order: 8, value: null },
          },
          computedInfo: {
            neighborhood: { order: 0, value: 'Zone 1' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 1 },
            surface: { order: 3, value: 10 },
            dateRange: { order: 4, value: '< 1946' },
            isHouse: { order: 5, value: undefined },
            max: { order: 6, value: 22.4 },
            maxAuthorized: { order: 7, value: 224 },
            promoPercentage: { order: 8, value: 53.33 },
          },
          isLegal: false,
        })

        done()
      } catch (e) {
        done.fail(e)
      }
    })
  })
})
