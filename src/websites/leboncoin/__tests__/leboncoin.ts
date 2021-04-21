jest.useFakeTimers()

import { Mapping } from '@interfaces/mapping'
import { LeBonCoin } from '../leboncoin'
const mongoose = require('mongoose')

describe('leboncoin', () => {
  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('paris', () => {
    test('returns clean ad', async (done) => {
      try {
        const body: Mapping = {
          id: '1968605259',
          cityLabel: "11e arrondissementparis 75011demander l'adresse precise",
          description:
            '2 pieces meuble paris 11eme proche nation.\n' +
            'paris 11eme - 2 pieces meubles\n' +
            'bd de charonne proche de nation.\n' +
            'proche metro avron a 50m\n' +
            'immeuble bien entretenu.\n' +
            'double digicode.\n' +
            'belle vue et degagee sans vis  vis.\n' +
            '30 m2 - tres clair et calme\n' +
            "l'appartement est enfilade.\n" +
            'entree\n' +
            'salon : canape convertible - table avec 4 chaises - table basse\n' +
            'chambre : lit 2 places - dressing - rangements\n' +
            'cuisine equipee et separee : frigo - lave linge - plaques induction  - micro-onde - four \n' +
            "salle d'eau renovee : wc douche lavabo\n" +
            'fenetres double vitrage.\n' +
            'chauffage individuel electric chaleur douce et economique.\n' +
            'libre fin avril\n' +
            'caution parentale souhaitee.\n' +
            'visite sur rdv.\n' +
            '1150e + 40 de charges',
          furnished: null,
          hasCharges: null,
          price: '1190',
          renter: 'Particulier',
          rooms: null,
          surface: null,
          title:
            '2 pieces meublee proche nation 75011 paris1 190 €charges comprisescc',
          platform: 'chrome',
          url: 'https://www.leboncoin.fr/locations/1968605259.htm?ac=558505705',
        }

        const mockResponse: any = {
          json: jest.fn(),
          status: jest.fn(),
        }

        const leboncoin = new LeBonCoin(mockResponse, { body })

        const data = await leboncoin.digData()

        expect(data).toEqual({
          detectedInfo: {
            address: { order: 0, value: 'boulevard de charonne 75011, Paris' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 2 },
            surface: { order: 3, value: 30 },
            yearBuilt: { order: 4, value: null },
            price: { order: 5, value: 1190 },
            charges: { order: 6, value: 40 },
            hasCharges: { order: 7, value: null },
          },
          computedInfo: {
            neighborhood: { order: 0, value: 'Roquette' },
            hasFurniture: { order: 1, value: true },
            roomCount: { order: 2, value: 2 },
            surface: { order: 3, value: 30 },
            dateRange: { order: 4, value: 'Avant 1946' },
            max: { order: 5, value: 32.76 },
            maxAuthorized: { order: 6, value: 982.8 },
            promoPercentage: { order: 7, value: 14.54 },
          },
          isLegal: false,
        })

        done()
      } catch (e) {
        done.fail(e)
      }
    })
  })

  // describe('lille', () => {
  //   test('returns clean ad', async (done) => {
  //     try {
  //       const body = {
  //         id: '1968605259',
  //         cityLabel: "11e arrondissementparis 75011demander l'adresse precise",
  //         description:
  //           '2 pieces meuble paris 11eme proche nation.\n' +
  //           'paris 11eme - 2 pieces meubles\n' +
  //           'bd de charonne proche de nation.\n' +
  //           'proche metro avron a 50m\n' +
  //           'immeuble bien entretenu.\n' +
  //           'double digicode.\n' +
  //           'belle vue et degagee sans vis  vis.\n' +
  //           '30 m2 - tres clair et calme\n' +
  //           "l'appartement est enfilade.\n" +
  //           'entree\n' +
  //           'salon : canape convertible - table avec 4 chaises - table basse\n' +
  //           'chambre : lit 2 places - dressing - rangements\n' +
  //           'cuisine equipee et separee : frigo - lave linge - plaques induction  - micro-onde - four \n' +
  //           "salle d'eau renovee : wc douche lavabo\n" +
  //           'fenetres double vitrage.\n' +
  //           'chauffage individuel electric chaleur douce et economique.\n' +
  //           'libre fin avril\n' +
  //           'caution parentale souhaitee.\n' +
  //           'visite sur rdv.\n' +
  //           '1150e + 40 de charges',
  //         furnished: null,
  //         hasCharges: null,
  //         price: '1190',
  //         renter: 'Particulier',
  //         rooms: null,
  //         surface: null,
  //         title:
  //           '2 pieces meublee proche nation 75011 paris1 190 €charges comprisescc',
  //         platform: 'chrome',
  //         url: 'https://www.leboncoin.fr/locations/1968605259.htm?ac=558505705',
  //       }

  //       const mockResponse: any = {
  //         json: jest.fn(),
  //         status: jest.fn(),
  //       }

  //       const leboncoin = new LeBonCoin(mockResponse, { body })

  //       const data = await leboncoin.digData()

  //       expect(data).toEqual({
  //         detectedInfo: {
  //           address: { order: 0, value: 'rue ferdinand mathias 59260, Lille' },
  //           hasFurniture: { order: 1, value: true },
  //           roomCount: { order: 2, value: 1 },
  //           surface: { order: 3, value: 20 },
  //           yearBuilt: { order: 4, value: '1900' },
  //           price: { order: 5, value: 595 },
  //           charges: { order: 6, value: 65 },
  //           hasCharges: { order: 7, value: null },
  //         },
  //         computedInfo: {
  //           neighborhood: { order: 0, value: 'Zone 2' },
  //           hasFurniture: { order: 1, value: true },
  //           roomCount: { order: 2, value: 1 },
  //           surface: { order: 3, value: 20 },
  //           dateRange: { order: 4, value: '< 1946' },
  //           max: { order: 5, value: 21.2 },
  //           maxAuthorized: { order: 6, value: 424 },
  //           promoPercentage: { order: 7, value: 20 },
  //         },
  //         isLegal: false,
  //       })

  //       done()
  //     } catch (e) {
  //       done.fail(e)
  //     }
  //   })
  // })
})
