import { Mapping } from '@interfaces/mapping'
import { SeLoger } from '../seloger'
const mongoose = require('mongoose')

describe('seloger', () => {
  afterAll(async () => {
    try {
      await mongoose.connection.close()
    } catch (e) {
      console.log(e)
    }
  })

  beforeEach(() => {
    jest.useFakeTimers()
  })

  describe('paris', () => {
    test('returns clean ad', async () => {
      const body: Mapping = {
        id: '234523',
        cityLabel: 'Paris 75011',
        charges: '45E',
        description: 'Joli 2 pièce bd valtair, 3 rue jean macée',
        furnished: true,
        hasCharges: false,
        price: '1400',
        renter: 'Particulier',
        rooms: '2 pièces',
        surface: '40m2',
        yearBuilt: null,
        title: null,
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
          address: { order: 0, value: '3 rue jean mace 75011, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 40 },
          yearBuilt: { order: 4, value: '1900' },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1400 },
          charges: { order: 7, value: 45 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Sainte-Marguerite' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 40 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 33.6 },
          maxAuthorized: { order: 7, value: 1344 },
          promoPercentage: { order: 8, value: 0.81 },
        },
        isLegal: false,
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const body = {
        id: '234523',
        cityLabel: 'à Lille (59260)',
        charges: '65',
        description:
          "Flatlooker vous permet de visiter et louer votre logement 100% en ligne. A côté de l'arrêt Mairie d'Helemmes, Flatlooker vous propose un T2 en location 73 Rue Ferdinand Mathias au deuxième étage, meublé dans une résidence calme et agréable. Appartement entièrement rénové.Votre pièce principale dispose d'un canapé, d'une table basse, d'un grand miroir et d'un placard de rangement. Côté cuisine vous trouverez un évier, des plaques de cuisson, une hotte aspirante, un réfrigérateur, un micro-ondes, de nombreux placards et tiroirs de rangement avec de la vaisselle. Dans votre chambre vous trouverez un lit double avec étagèresDans votre salle d'eau, vous disposerez d'une belle cabine de douche, des toilettes, une vasque avec miroir et des tiroirs de rangements.Belles prestations pour ce T2 en location spacieux, lumineux et calme.Les charges comprennent l'eau courante, l'eau chaude, le chauffage, l'électricité internet et l'entretien des parties communes. Commodités: MÉTRO (LIGNE 1) Arrêts Mairie d'Hellemmes et Square Flandres => 5min à pied Lille Centre et Gares => 5min de métroBus et V Lille à 5 min à pied FACSUniversité Lille 3 => 15min à pied Université Lille 1 => 10min en métro COMPLEXE SPORTIF avec piscine, terrain de tennis etc à 10min à piedCOMMERCESSupermarché à 150m Pharmacies; boulangeries; restaurants; bars au bout de la rueMarché les mercredi et samedi à 5min à piedPARC=> 5min à pied",
        furnished: true,
        hasCharges: true,
        price: '595 €cc',
        renter: 'FLATLOOKER',
        rooms: '1 pièce',
        surface: '20 m²',
        yearBuilt: 'Année de construction 1900',
        title: null,
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
          address: { order: 0, value: '73 rue ferdinand mathias 59260, Lille' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 20 },
          yearBuilt: { order: 4, value: '1900' },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 595 },
          charges: { order: 7, value: 65 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 1 },
          surface: { order: 3, value: 20 },
          dateRange: { order: 4, value: '< 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 22.4 },
          maxAuthorized: { order: 7, value: 448 },
          promoPercentage: { order: 8, value: 15.47 },
        },
        isLegal: false,
      })
    })
  })
})
