import { closeAllConnections } from '@db/db'
import { Mapping } from '@interfaces/mapping'
import { disconnect } from 'mongoose'
import { SeLoger } from '../seloger'

describe('seloger', () => {
  afterAll(() => closeAllConnections())
  afterAll(() => disconnect())

  describe('paris', () => {
    test('returns clean ad', async () => {
      const body: Mapping = {
        id: '234523',
        cityLabel: 'Paris 75011',
        charges: '45E',
        description: 'Joli 2 pièce 3 rue jean macea',
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

  describe('lyon', () => {
    test('returns clean ad - lyon', async () => {
      const body: Mapping = {
        id: '179200117',
        charges: '145',
        cityLabel: 'lyon (69009)',
        description:
          "224 rue de st cyr a proximite des monts d'or et des commerces. au sein d'une residence calme et securisee. t3 de 82m² au 1er etage avec ascenseur. compose d'un beau sejour de 22m² avec coin salle a manger de 8m² et cuisine separee de 8m². 2 chambres de 13.20 et 9.50m². salle de bains equipee d'un meuble sous evier et seche serviettes chauffant. un garage ferme en sous-sol ainsi qu'une place de parking privative sont compris dans le loyer. chauffage collectif de base puis appoint individuel electrique par radiateurs. logement renove.l'appartement donne sur un beau parc arbore. logement calme et lumineux.proche commoditesdemander plus d'informations a l'agenceafficher plus",
        furnished: undefined,
        hasCharges: true,
        price: '930',
        renter: 'cdc habitat',
        rooms: '4',
        surface: '82',
        title: 'location appartement',
        yearBuilt: null,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=179200117',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '224 rue de saint-cyr 69009, Lyon' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 4 },
          surface: { order: 3, value: 82 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 930 },
          charges: { order: 7, value: 145 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 3' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 4 },
          surface: { order: 3, value: 82 },
          dateRange: { order: 4, value: 'après 1990' },
          isHouse: { order: 5 },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
      })
    })

    test('returns clean ad - villeurbanne', async () => {
      const body: Mapping = {
        id: '179076503',
        charges: '45',
        cityLabel: 'villeurbanne (69100)',
        description:
          "a louer chez m poquet immobilier. t3 de 64 m2 au coeur du quartier des gratte-ciel a villeurbanne. dans ce bien en etage eleve (6eme etage), vous pourrez profiter d'une belle loggia donnant sur des espaces verts. cet appartement oriente sud offre un grand sejour lumineux. le bien beneficie de nombreux rangements. l'appartement est idealement situe a proximite immediate de toutes commodites : transports (metro a : station gratte-ciel a 3 minutes a pied, bus), commerces.. loyer de 920 eur par mois charges comprises, dont 45 eur par mois de provision pour charges. garage ferme en sous-sol. local a velos. depot de garantie : 875 eur. les honoraires a la charge des locataires sont de 692 eur, dont 192 eur pour l'etat des lieux.demander plus d'informations a l'agenceafficher plus",
        furnished: undefined,
        hasCharges: true,
        price: '920',
        renter: 'm poquet immobilier',
        rooms: '3',
        surface: '64',
        title: 'location appartement',
        yearBuilt: null,
        platform: 'chrome',
        url: 'https://seloger.com/dfdsfs?ad=179200117',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const seloger = new SeLoger(mockResponse, { body })

      const data = await seloger.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: '69100, Villeurbanne' },
          hasFurniture: { order: 1, value: null },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 64 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 920 },
          charges: { order: 7, value: 45 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 3' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 64 },
          dateRange: { order: 4, value: 'après 1990' },
          isHouse: { order: 5 },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
      })
    })
  })
})
