import { Rent } from '@db/db'
import { SaveRentService } from '@services/db/save-rent'
import { PrettyLog } from '@services/helpers/pretty-log'
import { closeDbConnections } from '@test-utils/website-test-harness'

afterAll(closeDbConnections)
afterEach(() => jest.restoreAllMocks())

const savedInfo = (over: object = {}) => ({
  id: '42',
  address: '12 rue de Paris',
  district: 'Zone 2',
  city: 'paris',
  mainCity: 'paris',
  isLegal: true,
  maxPrice: 30,
  postalCode: '75011',
  price: 900,
  priceExcludingCharges: 880,
  surface: 30,
  website: 'orpi',
  url: 'https://orpi.fr/42',
  ...over,
})

let saved: Record<string, unknown>
const captureSaved = () =>
  jest.spyOn(Rent.prototype, 'save').mockImplementation(async function (
    this: never,
  ) {
    saved = (
      this as unknown as { toObject: () => Record<string, unknown> }
    ).toObject()
  })

const save = (over: object = {}) =>
  new SaveRentService(savedInfo(over) as never).save()

describe('SaveRentService — champs toujours écrits', () => {
  it('écrit l’identité et le verdict de l’annonce', async () => {
    captureSaved()

    await save()

    expect(saved.id).toBe('42')
    expect(saved.url).toBe('https://orpi.fr/42')
    expect(saved.website).toBe('orpi')
    expect(saved.city).toBe('paris')
    expect(saved.mainCity).toBe('paris')
    expect(saved.district).toBe('Zone 2')
    expect(saved.isLegal).toBe(true)
    expect(saved.maxPrice).toBe(30)
    expect(saved.price).toBe(900)
    expect(saved.priceExcludingCharges).toBe(880)
    expect(saved.surface).toBe(30)
  })

  it('annonce l’enregistrement avant de le tenter', async () => {
    const log = jest.spyOn(PrettyLog, 'call')
    jest.spyOn(Rent.prototype, 'save').mockResolvedValue(undefined as never)

    await save()

    expect(log).toHaveBeenCalledWith('saving ad')
    expect(log).toHaveBeenCalledWith('ad saved', 'green')
  })
})

describe('SaveRentService — champs optionnels', () => {
  it.each([
    'dpe',
    'rentComplement',
    'address',
    'postalCode',
    'hasFurniture',
    'isHouse',
    'latitude',
    'longitude',
    'renter',
    'roomCount',
  ])('omet %s quand il n’y a rien à dire', async (key) => {
    captureSaved()

    await save({ [key]: undefined })

    expect(saved).not.toHaveProperty(key)
  })

  it.each(['dpe', 'rentComplement', 'renter', 'roomCount'])(
    'omet %s quand il vaut null',
    async (key) => {
      captureSaved()

      await save({ [key]: null })

      expect(saved).not.toHaveProperty(key)
    },
  )

  it.each([
    ['dpe', 'D'],
    ['rentComplement', 45],
    ['address', '5 rue Basse'],
    ['postalCode', '59000'],
    ['roomCount', 3],
    ['renter', 'Century 21'],
  ])('écrit %s quand il est renseigné', async (key, value) => {
    captureSaved()

    await save({ [key]: value })

    expect(saved[key]).toBe(value)
  })

  it('écrit hasFurniture à false (ce n’est pas la même chose qu’absent)', async () => {
    captureSaved()

    await save({ hasFurniture: false })

    expect(saved.hasFurniture).toBe(false)
  })

  it('écrit isHouse à false', async () => {
    captureSaved()

    await save({ isHouse: false })

    expect(saved.isHouse).toBe(false)
  })

  it('n’écrit pas isFake à false (le défaut du schéma suffit)', async () => {
    captureSaved()

    await save({ isFake: false })

    expect(saved).not.toHaveProperty('isFake')
  })

  it('écrit isFake à true', async () => {
    captureSaved()

    await save({ isFake: true })

    expect(saved.isFake).toBe(true)
  })

  it.each(['stations', 'yearBuilt'])(
    'omet %s quand la liste est vide',
    async (key) => {
      captureSaved()

      await save({ [key]: [] })

      expect(saved).not.toHaveProperty(key)
    },
  )

  it('écrit stations et yearBuilt quand ils sont remplis', async () => {
    captureSaved()

    await save({ stations: ['Châtelet'], yearBuilt: [1990, 1991] })

    expect(saved.stations).toEqual(['Châtelet'])
    expect(saved.yearBuilt).toEqual([1990, 1991])
  })

  it('distingue une valeur à zéro d’une valeur absente', async () => {
    captureSaved()

    await save({ rentComplement: 0, roomCount: 0 })

    expect(saved.rentComplement).toBe(0)
    expect(saved.roomCount).toBe(0)
  })
})

describe('SaveRentService — pannes d’enregistrement', () => {
  it('tolère un doublon et rafraîchit lastSeen', async () => {
    const log = jest.spyOn(PrettyLog, 'call')
    const updateOne = jest
      .spyOn(Rent, 'updateOne')
      .mockResolvedValue(undefined as never)
    jest.spyOn(Rent.prototype, 'save').mockRejectedValue({
      code: 11000,
      keyValue: { id: '42', website: 'orpi', priceExcludingCharges: 880 },
    })

    await save()

    expect(log).toHaveBeenCalledWith('⚠️ ad already saved', 'red')
    expect(updateOne).toHaveBeenCalledWith(
      { id: '42', website: 'orpi', priceExcludingCharges: 880 },
      { lastSeen: expect.any(Date) },
    )
  })

  it('journalise les autres pannes sans les avaler', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('mongo down')
    jest.spyOn(Rent.prototype, 'save').mockRejectedValue(error)

    await expect(save()).resolves.toBeUndefined()

    expect(consoleError).toHaveBeenCalledWith(error)
  })
})
