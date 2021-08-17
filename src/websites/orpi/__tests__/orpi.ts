jest.useFakeTimers()

import { Mapping } from '@interfaces/mapping'
import { Orpi } from '../orpi'
const mongoose = require('mongoose')

describe('orpi', () => {
  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('paris', () => {
    test('returns clean ad', async (done) => {
      try {
        const body: Mapping = {
          id: 'b-e1y6bt',
          charges: '54',
          cityLabel: 'paris 11',
          coord: { lat: 48.85676, lng: 2.387586 },
          description:
            "paris xi - metro philippe auguste- rue  carriere mainguet. a louer dans le cadre d'un bail  meuble- un studio  de 30 m2 situe au 3eme etage d'un immeuble bien entretenu. il est compose d'un grand sejour avec balcon, d'une cuisine independante amenagee et equipee et d'une salle de bains avec wc .   loyer 800 euros + 54 euros de charges = 854 euros charges comprises. depot de garantie 1600 euros. frais d'agence 450 euros.  dossiers complets souhaites avec  caution solidaire indispensable. contactez gilda par sms  au 06 14 15 13 47 . loyer mensuel 800 euros  - charges locatives 54 euros - location meublee.",
          hasCharges: true,
          furnished: true,
          price: 854,
          postalCode: '75011',
          renter: 'optimum',
          rooms: 1,
          surface: 30,
          title: 'appartement t1 paris 11 75011 b e1y6bt',
          yearBuilt: null,
          platform: 'chrome',
          url: 'https://www.orpi.com/annonce-location-appartement-t1-paris-11-75011-b-e1y6bt/',
        }

        const mockResponse: any = {
          json: jest.fn(),
          status: jest.fn(),
        }

        const orpi = new Orpi(mockResponse, { body })

        const data = await orpi.digData()

        expect(data).toEqual({
          detectedInfo: {
            address: { order: 0, value: 'rue carriere-mainguet 75011, Paris' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 1 },
            surface: { order: 3, value: 30 },
            yearBuilt: { order: 4, value: '1988' },
            price: { order: 5, value: 854 },
            charges: { order: 6, value: 54 },
            hasCharges: { order: 7, value: null },
          },
          computedInfo: {
            neighborhood: { order: 0, value: 'Roquette' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 1 },
            surface: { order: 3, value: 30 },
            dateRange: { order: 4, value: '1971-1990' },
            max: { order: 5, value: null },
            maxAuthorized: { order: 6, value: null },
            promoPercentage: { order: 7, value: null },
          },
          isLegal: true,
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
          id: 'b-e1xpqp',
          charges: '50',
          cityLabel: 'lille',
          coord: { lat: 50.636370149041, lng: 3.034930229187 },
          description:
            "(g) -  t2  meuble dans residence recente a proximite du bois de boulogne  a decouvrir : beau 2 pieces meuble offrant un sejour avec un petit  balcon et une belle cuisine equipee ouverte, une chambre avec un placard, une salle de bains, wc separes et une place de parking.  les plus : localisation, petit exterieur et une place de parking.   loyer mensuel : 574euros  loyer parking : 56euros (indissociable de l'appartement) provision de charges mensuelles : 50euros depot de garantie : deux mois de loyer hors charges  loyer mensuel 630 euros  - charges locatives 50 euros - honoraire ttc a la charge du locataire 478 euros dont 110 euros d'honoraires d'etat des lieux.",
          hasCharges: true,
          furnished: false,
          price: 680,
          postalCode: '59000',
          renter: 'orpi bcs immobilier',
          rooms: 2,
          surface: 36.81,
          title: 'appartement t2 lille 59000 b e1xpqp',
          yearBuilt: null,
          platform: 'chrome',
          url: 'https://www.orpi.com/annonce-location-appartement-t2-lille-59000-b-e1xpqp/',
        }

        const mockResponse: any = {
          json: jest.fn(),
          status: jest.fn(),
        }

        const orpi = new Orpi(mockResponse, { body })

        const data = await orpi.digData()

        expect(data).toEqual({
          detectedInfo: {
            address: { order: 0, value: 'place de saint-andre 59000, Lille' },
            hasFurniture: { order: 1, value: false },
            roomCount: { order: 2, value: 2 },
            surface: { order: 3, value: 36.81 },
            yearBuilt: { order: 4, value: null },
            price: { order: 5, value: 680 },
            charges: { order: 6, value: 50 },
            hasCharges: { order: 7, value: null },
          },
          computedInfo: {
            neighborhood: { order: 0, value: 'Zone 1' },
            hasFurniture: { order: 1, value: false },
            roomCount: { order: 2, value: 2 },
            surface: { order: 3, value: 36.81 },
            dateRange: { order: 4, value: '> 1990' },
            max: { order: 5, value: 16.9 },
            maxAuthorized: { order: 6, value: 622.09 },
            promoPercentage: { order: 7, value: 1.26 },
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
