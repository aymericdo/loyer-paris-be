import { IncompleteRent } from '@db/db'
import { Ad, CleanAd, FilteredResult } from '@interfaces/ad'
import { Body } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import { SerializerService } from '@services/api/serializer'
import { AvailableCities } from '@services/city-config/classic-cities'
import { SaveRentService } from '@services/db/save-rent'
import { DigService } from '@services/diggers/dig'
import { CityFilter } from '@services/filters/city-filter'
import { FilterFactory } from '@services/filters/encadrement-filter/filter-factory'
import { Website, WebsiteType } from '@services/websites/website'
import {
  closeDbConnections,
  mockExpressResponse,
} from '@test-utils/website-test-harness'

afterAll(closeDbConnections)
afterEach(() => jest.restoreAllMocks())
// `mappingImpl` est un état de module : sans remise à zéro, la panne d'un test
// fuit dans le suivant.
beforeEach(() => {
  mappingImpl = async () => fakeAd()
})

const SERIALIZED = { detectedInfo: { isLegal: true } }

const fakeAd = (over: Partial<Ad> = {}): Ad => ({
  id: '234523',
  cityLabel: 'paris',
  description: 'Appartement 3 pieces',
  price: 1500,
  surface: 60,
  ...over,
})

const fakeCleanAd = (over: Partial<CleanAd> = {}): CleanAd => ({
  id: '234523',
  roomCount: 3,
  hasFurniture: false,
  surface: 60,
  price: 1500,
  charges: 100,
  hasCharges: true,
  address: '16 rue b',
  postalCode: '75011',
  city: 'paris',
  coordinates: { lat: 48.85, lng: 2.37 },
  blurryCoordinates: { lat: 48.8, lng: 2.3 },
  yearBuilt: [1971, 1990],
  renter: 'Particulier',
  stations: ['République'],
  dpe: 'D',
  isHouse: false,
  rentComplement: 0,
  colocation: false,
  ...over,
})

const fakeFilteredResult = (
  over: Partial<FilteredResult> = {},
): FilteredResult => ({
  maxPrice: 30,
  refPrice: 25,
  minPrice: 20,
  districtName: 'Saint-Fargeau',
  isFurnished: false,
  roomCount: '3',
  yearBuilt: '1971-1990',
  ...over,
})

let mappingImpl: () => Promise<Ad> = async () => fakeAd()

/** Seul sous-type concret nécessaire : `mapping()` n'est qu'un point d'entrée. */
class WebsiteProbe extends Website {
  website: WebsiteType = 'orpi'

  async mapping(): Promise<Ad> {
    return mappingImpl()
  }
}

type ResponseProbe = { json: jest.Mock; status: jest.Mock }

const response = () => mockExpressResponse() as unknown as ResponseProbe

const withBody = (body: Partial<Body> = {}) =>
  new WebsiteProbe(response() as never, {
    body: {
      id: '234523',
      platform: 'chrome',
      url: 'https://www.orpi.com/annonce/123?utm_medium=email#photos',
      data: '{}',
      ...body,
    },
  })

/** Double le tunnel `dig → filter → save → serialize`, toutes coutures Mongo. */
const withPipeline = ({
  city = 'paris' as AvailableCities,
  cleanAd = fakeCleanAd(),
  filteredResult = fakeFilteredResult() as FilteredResult | null,
} = {}) => {
  const order: string[] = []
  const findCity = jest
    .spyOn(CityFilter.prototype, 'findCity')
    .mockReturnValue(city)
  const digInAd = jest
    .spyOn(DigService.prototype, 'digInAd')
    .mockResolvedValue(cleanAd)
  const find = jest.fn().mockResolvedValue(filteredResult)
  const currentEncadrementFilter = jest
    .spyOn(FilterFactory.prototype, 'currentEncadrementFilter')
    .mockReturnValue({ find } as never)
  const saved: SaveRentService[] = []
  const save = jest
    .spyOn(SaveRentService.prototype, 'save')
    .mockImplementation(async function (this: SaveRentService) {
      order.push('save')
      saved.push(this)
    })
  const serialize = jest
    .spyOn(SerializerService.prototype, 'serialize')
    .mockImplementation(() => {
      order.push('serialize')
      return SERIALIZED as never
    })

  return {
    findCity,
    digInAd,
    find,
    currentEncadrementFilter,
    save,
    saved,
    serialize,
    order,
  }
}

describe('Website.digData — chemin nominal', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))

  it('rend le logement sérialisé', async () => {
    withPipeline()

    await expect(withBody().digData()).resolves.toBe(SERIALIZED)
  })

  it('transmet la ville reconnue à la couche de dégagement', async () => {
    const { digInAd } = withPipeline()

    await withBody().digData()

    expect(digInAd).toHaveBeenCalledWith('paris')
    expect(
      (digInAd.mock.instances[0] as unknown as DigService).ad,
    ).toMatchObject({ id: '234523' })
  })

  it('retire les paramètres de l’URL avant de la persister', async () => {
    const { saved } = withPipeline()

    await withBody().digData()

    expect(saved[0].adToSave.url).toBe('https://www.orpi.com/annonce/123')
  })

  it('persiste l’annonce avant de la sérialiser', async () => {
    const { order } = withPipeline()

    await withBody().digData()

    expect(order).toEqual(['save', 'serialize'])
  })

  it('plafonne le loyer au mètre carré par la surface', async () => {
    const { saved } = withPipeline({
      filteredResult: fakeFilteredResult({ maxPrice: 30 }),
    })

    await withBody().digData()

    expect(saved[0].adToSave.maxPrice).toBe(1800)
  })

  it('retire les charges du loyer', async () => {
    const { saved } = withPipeline()

    await withBody().digData()

    expect(saved[0].adToSave.priceExcludingCharges).toBe(1400)
  })

  it('déclare le loyer légal quand il tient sous le plafond', async () => {
    const { saved } = withPipeline()

    await withBody().digData()

    expect(saved[0].adToSave.isLegal).toBe(true)
  })

  it('déclare le loyer illégal quand il dépasse le plafond', async () => {
    const { saved } = withPipeline({
      filteredResult: fakeFilteredResult({ maxPrice: 20 }),
    })

    await withBody().digData()

    expect(saved[0].adToSave.isLegal).toBe(false)
  })

  it('remonte la ville principale et l’absence de caractère fictif', async () => {
    const { saved } = withPipeline()

    await withBody().digData()

    expect(saved[0].adToSave.mainCity).toBe('paris')
    expect(saved[0].adToSave.isFake).toBe(false)
  })

  it('marque une ville d’essai', async () => {
    const { saved } = withPipeline({ city: 'brest' })

    await withBody().digData()

    expect(saved[0].adToSave.isFake).toBe(true)
  })

  it('transmet le quartier retenu', async () => {
    const { saved } = withPipeline()

    await withBody().digData()

    expect(saved[0].adToSave.district).toBe('Saint-Fargeau')
  })

  it('transmet la latitude et la longitude séparément', async () => {
    const { saved } = withPipeline()

    await withBody().digData()

    expect(saved[0].adToSave.latitude).toBe(48.85)
    expect(saved[0].adToSave.longitude).toBe(2.37)
  })

  it('transmet la surface, le prix, le loyer et le nombre de pièces', async () => {
    const { saved } = withPipeline()

    await withBody().digData()

    expect(saved[0].adToSave).toMatchObject({
      surface: 60,
      price: 1500,
      roomCount: 3,
      postalCode: '75011',
      website: 'orpi',
      renter: 'Particulier',
      yearBuilt: [1971, 1990],
    })
  })

  it('rend au sérialiseur les montants qu’il vient de calculer', async () => {
    const { serialize } = withPipeline({
      filteredResult: fakeFilteredResult({ maxPrice: 30 }),
    })

    await withBody().digData()

    expect(serialize).toHaveBeenCalledTimes(1)
    expect(serialize.mock.instances[0]).toMatchObject({
      serializedInfo: expect.objectContaining({
        isLegal: true,
        maxAuthorized: 1800,
        priceExcludingCharges: 1400,
      }),
      filteredResult: expect.objectContaining({ maxPrice: 30 }),
    })
  })

  it('construit le filtre pour la ville principale, pas pour la ville reconnue', async () => {
    const { currentEncadrementFilter } = withPipeline({ city: 'saint-denis' })

    await withBody().digData()

    expect(currentEncadrementFilter.mock.instances[0].mainCity).toBe(
      'plaineCommune',
    )
  })
})

describe('Website.digData — refus', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))

  it('refuse une colocation', async () => {
    withPipeline({ cleanAd: fakeCleanAd({ colocation: true }) })

    await expect(withBody().digData()).rejects.toMatchObject({
      error: ERROR_CODE.Colocation,
      msg: 'colocation found',
      isIncompleteAd: true,
    })
  })

  it('refuse quand aucun encadrement ne correspond', async () => {
    withPipeline({ filteredResult: null })

    await expect(withBody().digData()).rejects.toMatchObject({
      error: ERROR_CODE.Filter,
      msg: 'no match found',
      isIncompleteAd: true,
    })
  })

  it('joint le contexte de l’annonce à l’erreur', async () => {
    withPipeline({ filteredResult: null })

    await expect(withBody().digData()).rejects.toMatchObject({
      incompleteAd: {
        id: '234523',
        website: 'orpi',
        url: 'https://www.orpi.com/annonce/123',
        city: 'paris',
      },
    })
  })

  it('propage l’erreur d’origine', async () => {
    const { digInAd } = withPipeline()
    digInAd.mockRejectedValue({ error: ERROR_CODE.Other, msg: 'boom' })

    await expect(withBody().digData()).rejects.toMatchObject({
      error: ERROR_CODE.Other,
      msg: 'boom',
    })
  })

  it('journalise l’échec', async () => {
    withPipeline({ filteredResult: null })

    await expect(withBody().digData()).rejects.toBeDefined()

    expect(console.error).toHaveBeenCalled()
  })

  it('ne persiste rien quand elle refuse', async () => {
    const { save, serialize } = withPipeline({ filteredResult: null })

    await expect(withBody().digData()).rejects.toBeDefined()

    expect(save).not.toHaveBeenCalled()
    expect(serialize).not.toHaveBeenCalled()
  })

  it('laisse la ville nulle quand la reconnaissance a échoué', async () => {
    withPipeline()
    jest.spyOn(CityFilter.prototype, 'findCity').mockImplementation(() => {
      throw { error: ERROR_CODE.Address, msg: 'city not found' }
    })

    await expect(withBody().digData()).rejects.toMatchObject({
      error: ERROR_CODE.Address,
      incompleteAd: expect.objectContaining({ city: null }),
    })
  })
})

describe('Website.analyse', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))

  it('répond avec le logement sérialisé', async () => {
    withPipeline()
    const probe = withBody()
    const res = probe.res as unknown as ResponseProbe

    await probe.analyse()

    expect(res.json).toHaveBeenCalledWith(SERIALIZED)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('répond le code de refus et l’erreur', async () => {
    withPipeline({ cleanAd: fakeCleanAd({ colocation: true }) })
    const probe = withBody()
    const res = probe.res as unknown as ResponseProbe

    await probe.analyse()

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: ERROR_CODE.Colocation }),
    )
  })

  it('répond 422 quand aucun encadrement ne correspond', async () => {
    withPipeline({ filteredResult: null })
    const probe = withBody()
    const res = probe.res as unknown as ResponseProbe

    await probe.analyse()

    expect(res.status).toHaveBeenCalledWith(422)
  })

  it('enregistre l’annonce incomplète avant de répondre', async () => {
    const saveIncomplete = jest.spyOn(IncompleteRent.prototype, 'save')
    withPipeline({ cleanAd: fakeCleanAd({ colocation: true }) })

    await withBody().analyse()

    expect(saveIncomplete).toHaveBeenCalledTimes(1)
  })

  it('relance une panne serveur sans répondre', async () => {
    const { digInAd } = withPipeline()
    digInAd.mockRejectedValue({
      error: ERROR_CODE.Other,
      msg: 'panne',
      status: 503,
    })
    const probe = withBody()
    const res = probe.res as unknown as ResponseProbe

    await expect(probe.analyse()).rejects.toMatchObject({ status: 503 })

    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('[constat] écrase les vraies erreurs en les re-emballant', async () => {
    const { digInAd } = withPipeline()
    digInAd.mockRejectedValue(new Error('panne'))
    const probe = withBody()
    const res = probe.res as unknown as ResponseProbe

    // `throw { ...err, incompleteAd }` jette un Error vidé de sa substance :
    // un Error n'a que des propriétés non énumérables, le spread ne garde donc
    // que `incompleteAd`. Le message et la pile disparaîssent — logger() écrit
    // alors « [ERROR 500] undefined » sur une panne réelle.
    await expect(probe.digData()).rejects.toEqual({
      incompleteAd: expect.objectContaining({ id: '234523' }),
    })
    await expect(probe.analyse()).rejects.toBeDefined()
    expect(res.status).not.toHaveBeenCalled()
  })
})

// CONSTAT D'AUDIT — orpi.ts affirme que le try/catch de Website.analyse()
// ré-emballe les erreurs du mapping avec le contexte `incompleteAd`. C'est faux :
// `mapping()` et `new URL()` sont appelés AVANT le try de digData(), et analyse()
// n'ajoute jamais ce contexte. saveIncompleteRent() exige `isIncompleteAd` ET
// `incompleteAd` : une casse de mapping ne laisse donc aucune trace.
describe('[constat] Website — la casse de mapping ne laisse pas de trace', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))

  it('laisse filer l’erreur de mapping sans contexte', async () => {
    mappingImpl = async () => {
      throw { error: ERROR_CODE.Minimal, msg: 'no more id for orpi/chrome' }
    }

    await expect(withBody().digData()).rejects.toMatchObject({
      error: ERROR_CODE.Minimal,
      msg: 'no more id for orpi/chrome',
    })
    await expect(withBody().digData()).rejects.not.toHaveProperty(
      'incompleteAd',
    )
  })

  it('n’enregistre aucune annonce incomplète', async () => {
    const saveIncomplete = jest.spyOn(IncompleteRent.prototype, 'save')
    mappingImpl = async () => {
      throw { error: ERROR_CODE.Minimal, msg: 'no more data' }
    }
    const probe = withBody()
    const res = probe.res as unknown as ResponseProbe

    await probe.analyse()

    expect(saveIncomplete).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('laisse aussi filer une URL malformée', async () => {
    withPipeline()

    // `new URL()` est appelé avant le try de digData() : l'échec sort nu, sans
    // le contexte `incompleteAd`. (Comparaison sur le message : la TypeError de
    // node:url vient d'un autre realm, `instanceof` la manque.)
    await expect(withBody({ url: 'pas-une-url' }).digData()).rejects.toThrow(
      /Invalid URL/,
    )
    await expect(
      withBody({ url: 'pas-une-url' }).digData(),
    ).rejects.not.toHaveProperty('incompleteAd')
  })
})
