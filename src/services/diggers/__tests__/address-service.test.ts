import axios from 'axios'
import { Ad } from '@interfaces/ad'
import { AddressResponse } from '@interfaces/address'
import { ERROR_CODE } from '@services/api/errors'
import { AddressService } from '@services/diggers/address-service'
import { closeDbConnections } from '@test-utils/website-test-harness'

jest.mock('axios')

const mockedAxios = axios as unknown as jest.Mock

const ad = (over: Partial<Ad> = {}): Ad => ({ ...over }) as Ad

/**
 * Forme enregistrée d'une réponse de data.geopf.fr/geocodage/completion.
 * C'est la frontière la plus fragile du service : si l'API change de forme,
 * ce test est le premier à tomber.
 */
const geopfResponse = (over: Partial<AddressResponse> = {}): AddressResponse =>
  ({
    status: 'OK',
    results: [
      {
        x: 653561.11,
        y: 6863009.07,
        country: 'France',
        city: 'Paris',
        oldcity: '',
        kind: 'street',
        zipcode: '75011',
        street: 'Boulevard Voltaire',
        metropole: true,
        fulltext: '16 Boulevard Voltaire 75011 Paris',
        classification: 8,
      },
    ],
    ...over,
  }) as AddressResponse

afterAll(closeDbConnections)

afterEach(() => {
  jest.restoreAllMocks()
  mockedAxios.mockReset()
})

describe('AddressService.getAddresses — appel à data.geopf.fr', () => {
  it('n’interroge pas l’API pour une requête trop courte', async () => {
    await expect(AddressService.getAddresses('paris', 'rue')).resolves.toEqual(
      [],
    )

    expect(mockedAxios).not.toHaveBeenCalled()
  })

  it('traduit la réponse geopf en item d’adresse interne', async () => {
    mockedAxios.mockResolvedValue({ data: geopfResponse() })

    await expect(
      AddressService.getAddresses('paris', '16 boulevard voltaire'),
    ).resolves.toEqual([
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [653561.11, 6863009.07] },
        properties: {
          label: '16 Boulevard Voltaire 75011 Paris',
          score: 1,
          housenumber: '16',
          id: '75056_Boulevard_Voltaire_16',
          name: '16 Boulevard Voltaire',
          postcode: '75011',
          citycode: '75056',
          x: 653561.11,
          y: 6863009.07,
          city: 'Paris',
          importance: 1,
          street: 'Boulevard Voltaire',
        },
      },
    ])
  })

  it('accepte une voie sans numéro', async () => {
    mockedAxios.mockResolvedValue({
      data: geopfResponse({
        results: [
          {
            ...geopfResponse().results[0],
            fulltext: 'Boulevard Voltaire 75011 Paris',
          },
        ],
      }),
    })

    const [item] = await AddressService.getAddresses(
      'paris',
      'boulevard voltaire',
    )

    expect(item.properties.housenumber).toBe('')
    expect(item.properties.name).toBe('Boulevard Voltaire')
    expect(item.properties.id).toBe('75056_Boulevard_Voltaire_00000')
  })

  it('renvoie une liste vide quand l’API ne trouve rien', async () => {
    mockedAxios.mockResolvedValue({ data: geopfResponse({ results: [] }) })

    await expect(
      AddressService.getAddresses('paris', '16 boulevard voltaire'),
    ).resolves.toEqual([])
  })

  it('renvoie une liste vide quand la réponse est méconnaissable', async () => {
    mockedAxios.mockResolvedValue({ data: {} })

    await expect(
      AddressService.getAddresses('paris', '16 boulevard voltaire'),
    ).resolves.toEqual([])
  })

  it('échoue tout de suite sur une indisponibilité (504), sans réessayer', async () => {
    mockedAxios.mockRejectedValue({
      message: 'gateway timeout',
      response: { status: 504 },
    })

    await expect(
      AddressService.getAddresses('paris', '16 boulevard voltaire'),
    ).rejects.toMatchObject({ error: ERROR_CODE.ApiAdresseError })

    expect(mockedAxios).toHaveBeenCalledTimes(1)
  })

  it('réessaie après une erreur passagère et finit par répondre', async () => {
    jest.useFakeTimers()
    mockedAxios
      .mockRejectedValueOnce({ message: 'boom' })
      .mockResolvedValueOnce({ data: geopfResponse() })

    const pending = AddressService.getAddresses(
      'paris',
      '16 boulevard voltaire',
    )

    // Premier échec → attente doublée de 1 s avant la seconde tentative
    await jest.advanceTimersByTimeAsync(1000)

    await expect(pending).resolves.toHaveLength(1)
    expect(mockedAxios).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })

  it('abandonne après cinq tentatives infructueuses', async () => {
    jest.useFakeTimers()
    mockedAxios.mockRejectedValue({ message: 'boom' })

    const pending = AddressService.getAddresses(
      'paris',
      '16 boulevard voltaire',
    )
    const assertion = expect(pending).rejects.toMatchObject({
      error: ERROR_CODE.ApiAdresseError,
    })

    // 1 s + 2 s + 4 s + 8 s entre les cinq tentatives
    await jest.advanceTimersByTimeAsync(15000)

    await assertion
    expect(mockedAxios).toHaveBeenCalledTimes(5)

    jest.useRealTimers()
  })
})

type CompletedResult = {
  item: {
    address: string
    postalCode: string
    coordinate: { lng: number; lat: number }
  }
  score: number
  streetNumber: string
}[]

const prototype = AddressService.prototype as unknown as {
  getAddressCompleted: jest.Mock
}

const stubCompleted = (result: CompletedResult) =>
  jest.spyOn(prototype, 'getAddressCompleted').mockResolvedValue(result)

const result = (
  over: Partial<CompletedResult[number]> = {},
): CompletedResult[number] => ({
  item: {
    address: '16 rue de la roquette',
    postalCode: '75011',
    coordinate: { lng: 2.37, lat: 48.85 },
  },
  score: 1,
  streetNumber: '16',
  ...over,
})

describe('AddressService.getAddress — du texte à l’adresse', () => {
  it('retient l’adresse numérotée et la classe en coordonnée précise', async () => {
    stubCompleted([result()])

    const service = new AddressService(
      'paris',
      '75011',
      ad({ address: '16 rue de la roquette' }),
    )
    const [street, coordinates, blurryCoordinates] = await service.getAddress()

    expect(street).toBe('16 rue de la roquette')
    expect(coordinates).toEqual({ lng: 2.37, lat: 48.85 })
    expect(blurryCoordinates).toBeNull()
  })

  it('classe une voie sans numéro en coordonnée floue', async () => {
    stubCompleted([result({ streetNumber: '' })])

    const service = new AddressService(
      'paris',
      '75011',
      ad({ address: '16 rue de la roquette' }),
    )
    const [street, coordinates, blurryCoordinates] = await service.getAddress()

    // Le numéro est retiré : on ne sait situer que la voie
    expect(street).toBe('rue de la roquette')
    expect(coordinates).toBeNull()
    expect(blurryCoordinates).toEqual({ lng: 2.37, lat: 48.85 })
  })

  it('préfère les coordonnées précises fournies par l’annonce', async () => {
    stubCompleted([result()])

    const service = new AddressService(
      'paris',
      '75011',
      ad({
        address: '16 rue de la roquette',
        coord: { lng: 2.3487234872394872, lat: 48.85661412345678 },
      }),
    )
    const [street, coordinates, blurryCoordinates] = await service.getAddress()

    expect(street).toBe('16 rue de la roquette')
    expect(coordinates).toEqual({
      lng: 2.3487234872394872,
      lat: 48.85661412345678,
    })
    expect(blurryCoordinates).toEqual({
      lng: 2.3487234872394872,
      lat: 48.85661412345678,
    })
  })

  it('se rabat sur le titre quand l’adresse ne donne rien', async () => {
    const spy = stubCompleted([])
    spy.mockResolvedValueOnce([]).mockResolvedValueOnce([result()])

    const service = new AddressService(
      'paris',
      '75011',
      ad({ address: '1 rue inconnue', title: '16 rue de la roquette' }),
    )
    const [street] = await service.getAddress()

    expect(street).toBe('16 rue de la roquette')
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('écarte un résultat qui n’est pas dans le code postal visé', async () => {
    stubCompleted([result()])

    const service = new AddressService(
      'paris',
      '75012',
      ad({ address: '16 rue de la roquette' }),
    )
    await expect(service.getAddress()).resolves.toEqual([null, null, null])
  })

  it('retient le meilleur score parmi les candidats', async () => {
    stubCompleted([
      result({
        score: 0.5,
        streetNumber: '15',
        item: { ...result().item, address: '15 rue a' },
      }),
      result({
        score: 0.9,
        streetNumber: '16',
        item: { ...result().item, address: '16 rue b' },
      }),
    ])

    const service = new AddressService(
      'paris',
      '75011',
      ad({ address: '16 rue de la roquette' }),
    )
    const [street] = await service.getAddress()

    expect(street).toBe('16 rue b')
  })

  it('rend trois fois null quand aucun texte ne contient d’adresse', async () => {
    const spy = stubCompleted([])

    const service = new AddressService(
      'paris',
      '75011',
      ad({
        address: 'rien du tout',
        title: 'non plus',
        description: 'toujours pas',
      }),
    )

    await expect(service.getAddress()).resolves.toEqual([null, null, null])
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('AddressService.getAddressCompleted', () => {
  it('traduit un item interne en candidat d’adresse', async () => {
    jest.spyOn(AddressService, 'getAddresses').mockResolvedValue([
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [2.37, 48.85] },
        properties: {
          label: '16 rue de la roquette 75011 Paris',
          score: 0.87,
          housenumber: '16',
          id: '75111_1_00016',
          name: '16 rue de la roquette',
          postcode: '75011',
          citycode: '75111',
          x: 2.37,
          y: 48.85,
          city: 'Paris',
          street: 'rue de la roquette',
        },
      },
    ])

    const service = new AddressService(
      'paris',
      '75011',
      ad({ address: '16 rue de la roquette' }),
    )
    const [street, coordinates] = await service.getAddress()

    expect(street).toBe('16 rue de la roquette')
    expect(coordinates).toEqual({ lng: 2.37, lat: 48.85 })
  })

  it('ne demande rien pour une requête vide', async () => {
    const spy = jest.spyOn(AddressService, 'getAddresses')

    await expect(prototype.getAddressCompleted('paris', '')).resolves.toBeNull()

    expect(spy).not.toHaveBeenCalled()
  })
})
