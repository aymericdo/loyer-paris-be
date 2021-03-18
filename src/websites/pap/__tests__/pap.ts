jest.useFakeTimers()

import { Mapping } from '@interfaces/mapping'
import { Pap } from '../pap'
const mongoose = require('mongoose')

describe('pap', () => {
  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('paris', () => {
    test('returns clean ad', async (done) => {
      try {
        const body: Mapping = {
          id: 'r421900951',
          cityLabel: 'paris 11e (75011)',
          description:
            "rue amelot, limite marais, entre cirque d'hiver et bastille.\n" +
            '\n' +
            'studio non meuble de  21 m2 entierement refait a neuf, clair  : petite entree independante, grand placard/penderie, salle de bains + wc et lavabo, cuisine equipee (branchement machine a laver), sejour avec fenetre.\n' +
            'sur jardin arbore, sans vis-a-vis, 2 ascenseurs. gardien, entree avec bip, interphone. chauffage et eau chaude collectifs.\n' +
            '\n' +
            'cave.\n' +
            'loyer : 719 e/mois + 100 e provision charges.\n' +
            '\n' +
            'possibilite parking.\n' +
            '\n' +
            'serieuses references et caution solidaire demandees.',
          price: '819',
          rooms: '1',
          renter: 'Particulier',
          surface: '21',
          title: 'location studio 21 m² paris 11e\t\t\t\t819 €',
          stations: [],
          platform: 'chrome',
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
              value: 'rue amelot 75011, Paris',
            },
            hasFurniture: {
              order: 1,
              value: false,
            },
            roomCount: {
              order: 2,
              value: 1,
            },
            surface: {
              order: 3,
              value: 21,
            },
            yearBuilt: {
              order: 4,
              value: null,
            },
            price: {
              order: 5,
              value: 819,
            },
            charges: {
              order: 6,
              value: null,
            },
            hasCharges: {
              order: 7,
              value: null,
            },
          },
          computedInfo: {
            neighborhood: {
              order: 0,
              value: 'Roquette',
            },
            hasFurniture: {
              order: 1,
              value: false,
            },
            roomCount: {
              order: 2,
              value: 1,
            },
            surface: {
              order: 3,
              value: 21,
            },
            dateRange: {
              order: 4,
              value: 'Avant 1946',
            },
            max: {
              order: 5,
              value: 33.72,
            },
            maxAuthorized: {
              order: 6,
              value: 708.12,
            },
            promoPercentage: {
              order: 7,
              value: 13.54,
            },
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
          id: 'r435801923',
          cityLabel: 'lille (59000)',
          description:
            't3 etat neuf, 2eme etage, 53m², dans une petite residence privee, limite lille  mons-en-barœul, a 200m du metro station mons sart, 1 km euralille.\n' +
            'stationnement facile et gratuit.\n' +
            '\n' +
            'sol parquet. sejour plein sud tres lumineux,\n' +
            '2 chambres (une cote jardin, une au-dessus du sejour).\n' +
            'isolation haute performance, double vitrage, chauffage individuel, electrique. cuisine semi-equipee.\n' +
            'salle de bain, baignoire/douche, emplacement lave-linge. 680€ + 75€ de charges. libre.\n' +
            'contact uniquement par telephone.',
          price: '755',
          rooms: '3',
          renter: 'Particulier',
          surface: '53',
          title:
            'location appartement 3 pieces 53 m² lille (59000)\t\t\t\t755 €',
          stations: [],
          platform: 'chrome',
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
            hasFurniture: { order: 1, value: null },
            roomCount: { order: 2, value: 3 },
            surface: { order: 3, value: 53 },
            yearBuilt: { order: 4, value: null },
            price: { order: 5, value: 755 },
            charges: { order: 6, value: 75 },
            hasCharges: { order: 7, value: null },
          },
          computedInfo: {
            neighborhood: { order: 0, value: 'Zone 1' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 3 },
            surface: { order: 3, value: 53 },
            dateRange: { order: 4, value: '> 1990' },
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
})
