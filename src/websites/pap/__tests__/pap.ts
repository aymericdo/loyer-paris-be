import { closeAllConnections } from '@db/db'
import { Mapping } from '@interfaces/mapping'
import { disconnect } from 'mongoose'
import { Pap } from '../pap'

describe('pap', () => {
  afterAll(() => closeAllConnections())
  afterAll(() => disconnect())

  describe('paris', () => {
    test('returns clean ad', async () => {
      const body: Mapping = {
        id: 'r421900951',
        cityLabel: 'paris 11e (75011)',
        description:
          "16 rue amelot, limite marais, entre cirque d'hiver et bastille.\n" +
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
            value: '16 rue amelot 75011, Paris',
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
            value: '1971',
          },
          isHouse: { order: 5, value: null },
          price: {
            order: 6,
            value: 819,
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
            value: 'Roquette',
          },
          hasFurniture: {
            order: 1,
            value: false,
          },
          roomCount: {
            order: 2,
            value: '1',
          },
          surface: {
            order: 3,
            value: 21,
          },
          dateRange: {
            order: 4,
            value: 'Avant 1946',
          },
          isHouse: { order: 5, value: undefined },
          max: {
            order: 6,
            value: 34.32,
          },
          maxAuthorized: {
            order: 7,
            value: 720.72,
          },
          promoPercentage: {
            order: 8,
            value: 12,
          },
        },
        isLegal: false,
      })
    })
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const body: Mapping = {
        id: 'r435801923',
        cityLabel: 'lille (59000)',
        description:
          'cite jardins t3 etat neuf, 2eme etage, 53m², dans une petite residence privee, limite lille  mons-en-barœul, a 200m du metro station mons sart, 1 km euralille.\n' +
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
        title: 'location appartement 3 pieces 53 m² lille (59000)\t\t\t\t755 €',
        stations: [],
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
          address: { order: 0, value: 'cite jardins 59000, Lille' },
          hasFurniture: { order: 1, value: null },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 53 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 755 },
          charges: { order: 7, value: 75 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 1' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '3' },
          surface: { order: 3, value: 53 },
          dateRange: { order: 4, value: '> 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
      })
    })
  })

  describe('lyon', () => {
    test('returns clean ad - villeurbanne', async () => {
      const body: Mapping = {
        id: 'r419900511',
        cityLabel: 'villeurbanne (69100)',
        description:
          'joli appartement tres clair rue des charmettes (metro charpennes).\n' +
          '44 m² traversant 2e etage immeuble ancien sans vis-a-vis.\n' +
          'peut etre loue meuble pour 2 etudiants ou couple (2 mois de depot de garantie) ou  loue vide (1 mois de depot de garantie).\n' +
          'entree, cuisine avec alcove, sejour avec alcove, salle de douche, wc independant.\n' +
          'nombreux placards. interphone et digicode.\n' +
          '\n' +
          'loyer 629 €/mois +41 € charges.',
        price: '670',
        rooms: '2',
        renter: 'Particulier',
        surface: '44',
        title:
          'location meublee appartement 2 pieces 44 m² villeurbanne (69100)\t\t\t\t670 €',
        stations: [],
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
            value: 'rue des charmettes 69100, Villeurbanne',
          },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 44 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 670 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 3' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '2' },
          surface: { order: 3, value: 44 },
          dateRange: { order: 4, value: 'après 1990' },
          isHouse: { order: 5 },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
      })
    })

    test('returns clean ad - lyon', async () => {
      const body: Mapping = {
        id: 'r195110948',
        cityLabel: 'lyon 3e (69003)',
        description:
          'a 5mn de la gare part-dieu, rue danton.\n' +
          '\n' +
          'dans immeuble standing au calme, au 2eme avec ascenseur, beau t3 de 76 m2 traversant bien agence + loggias 13 m2 avec 2 garages + 1 cave.\n' +
          '\n' +
          '- sejour ouvrant sur un balcon cote jardin,\n' +
          '- 2 chambres avec placard,\n' +
          '- salle de bains et wc separes.\n' +
          '\n' +
          'belles prestations, double vitrage, volets electriques, chauffage individuel.\n' +
          'proximite metro, commerces et ecoles.\n' +
          '\n' +
          'libre debut decembre 2021\n' +
          '\n' +
          'loyer : 1.110 e/mois + 90 e provision charges.',
        price: '1200',
        rooms: '3',
        renter: 'Particulier',
        surface: '76',
        title: 'location appartement 3 pieces 76 m² lyon 3e\t\t\t\t1.200 €',
        stations: [],
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
          address: { order: 0, value: 'rue danton 69003, Lyon' },
          hasFurniture: { order: 1, value: null },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 76 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1200 },
          charges: { order: 7, value: null },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 2' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '3' },
          surface: { order: 3, value: 76 },
          dateRange: { order: 4, value: 'après 1990' },
          isHouse: { order: 5 },
          max: { order: 6, value: 15.5 },
          maxAuthorized: { order: 7, value: 1178 },
          promoPercentage: { order: 8, value: 1.83 },
        },
        isLegal: false,
      })
    })
  })
})
