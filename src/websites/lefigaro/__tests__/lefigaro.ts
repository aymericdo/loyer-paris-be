import { Mapping } from '@interfaces/mapping';
import { LeFigaro } from '../lefigaro';
import { disconnect } from 'mongoose';
import { closeAllConnections } from '@db/db';

describe('lefigaro', () => {
  afterAll(() => closeAllConnections())
  afterAll(() => disconnect())

  describe('paris', () => {
    test('returns clean ad', async () => {
      const body: Mapping = {
        id: '31231985',
        charges: '130',
        cityLabel: '\n            à Paris 17ème\n            \n        ',
        description:
          'rue guttin a louer 1 250euros /mois cc paris 17e, metro wagram ou villiers et gare sncf pont cardinet souplex traversant de 50 m² recemment renove l\'appartement: ? sejour 23 m²: canape-lit, grand table avec 4 chaises, tv hd, bureau ? cuisine: 4 plaques de cuisson vitroceramique, refrigerateur, congelateur, mini four, micro-ondes, ? salle de bain: lave-linge, baignoire, lave main, wc ? chauffage et eau chaude collectifs au sous-sol: avec puits de lumiere: ? 12 m² accessible par escalier interieur en chene, placard, parquet au sol l\'immeuble: art-deco en pierre de taille, gardien, digicode depot de garantie: 2 240euros part d\'honoraires du locataire: 780euros mandat n° 42 passy @immo-global',
        furnished: true,
        hasCharges: true,
        price: '1250',
        renter: 'passy@global immo',
        rooms: '2',
        surface: '52',
        title:
          'location appartement meuble 2 pieces 52 m2 \n' +
          '        \n' +
          '            a paris 17eme',
        platform: 'chrome',
        url: 'https://immobilier.lefigaro.fr/annonces/annonce-31231985.html1',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const lefigaro = new LeFigaro(mockResponse, { body })

      const data = await lefigaro.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: 'rue guttin 75017, Paris' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: 2 },
          surface: { order: 3, value: 52 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1250 },
          charges: { order: 7, value: 130 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Epinettes' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '2' },
          surface: { order: 3, value: 52 },
          dateRange: { order: 4, value: 'Avant 1946' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: null },
          maxAuthorized: { order: 7, value: null },
          promoPercentage: { order: 8, value: null },
        },
        isLegal: true,
        moreInfo:
          'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
      })
    });
  })

  describe('lille', () => {
    test('returns clean ad', async () => {
      const body: Mapping = {
        id: '34819129',
        charges: '88',
        cityLabel: '\n            à Lille\n            \n        ',
        description:
          'happy-immo vous propose a la location ce splendide type 3 de 70 m2, situe place sebastopol, a proximite immediate de republique. \n' +
          '\n' +
          'hall avec rangements, beau sejour en -l- tres lumineux, cuisine ouverte amenagee, 2 chambres, salle de bains. \n' +
          ' \n' +
          'chaudiere individuelle gaz, double vitrage, nombreux rangements.\n' +
          '\n' +
          '3eme et dernier etage, sans ascenseur. \n' +
          '\n' +
          'loyer : 952€\n' +
          '+ charges 88 € (eau, entretien des communs, electricite des communs, entretien extincteurs et alarmes, et petites reparations)\n' +
          '. happy-immo est un reseau de 80 agents independants presents dans le nord et le pas de calais. pour acheter, vendre, louer ou gerer votre maison, immeuble, appartement, terrain\n' +
          'camille  delbroeck - 0650920203, rsac n° 802761333, agent commercial chez happy-immo - 1er reseau regional d\'agents independants dans le nord et le pas de calais.pour acheter, vendre, louer, gerer vos immeubles, maisons, appartements, terrains et locaux commerciaux, faites appel a un des 80 agents happy-immo.',
        furnished: null,
        hasCharges: true,
        price: '1040',
        renter: 'happy immo.fr',
        rooms: '3',
        surface: '70',
        title:
          'location appartement 3 pieces 70 m2 \n        \n            a lille',
        platform: 'chrome',
        url: 'https://immobilier.lefigaro.fr/annonces/annonce-34819129.html',
      }

      const mockResponse: any = {
        json: jest.fn(),
        status: jest.fn(),
      }

      const lefigaro = new LeFigaro(mockResponse, { body })

      const data = await lefigaro.digData()

      expect(data).toEqual({
        detectedInfo: {
          address: { order: 0, value: 'place sebastopol, Lille' },
          hasFurniture: { order: 1, value: null },
          roomCount: { order: 2, value: 3 },
          surface: { order: 3, value: 70 },
          yearBuilt: { order: 4, value: null },
          isHouse: { order: 5, value: null },
          price: { order: 6, value: 1040 },
          charges: { order: 7, value: 88 },
          hasCharges: { order: 8, value: null },
        },
        computedInfo: {
          neighborhood: { order: 0, value: 'Zone 3' },
          hasFurniture: { order: 1, value: true },
          roomCount: { order: 2, value: '3' },
          surface: { order: 3, value: 70 },
          dateRange: { order: 4, value: '> 1990' },
          isHouse: { order: 5, value: undefined },
          max: { order: 6, value: 13.3 },
          maxAuthorized: { order: 7, value: 931 },
          promoPercentage: { order: 8, value: 2.21 },
        },
        isLegal: false,
        moreInfo: 'https://encadrement-loyers.lille.fr/',
      })
    });
  })
});
