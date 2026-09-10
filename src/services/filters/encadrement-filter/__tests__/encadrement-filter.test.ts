import { Zone, ZoneDocument } from '@db/zone.model'
import { InfoToFilter } from '@interfaces/ad'
import { DefaultEncadrementItem, EncadrementItem } from '@interfaces/shared'
import { ObservatoireEncadrementItem } from '@interfaces/observatoire-des-loyers'
import { ParisEncadrementItem } from '@interfaces/paris'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { EstEnsembleFilter } from '@services/filters/encadrement-filter/est-ensemble-filter'
import { FakeFilter } from '@services/filters/encadrement-filter/fake-filter'
import { FilterFactory } from '@services/filters/encadrement-filter/filter-factory'
import { FilterParent } from '@services/filters/encadrement-filter/filter-parent'
import { GenericFilter } from '@services/filters/encadrement-filter/generic-filter'
import { GrenobleFilter } from '@services/filters/encadrement-filter/grenoble-filter'
import { getJsonPath } from '@services/filters/encadrement-filter/json-path'
import { ParisFilter } from '@services/filters/encadrement-filter/paris-filter'
import { PlaineCommuneFilter } from '@services/filters/encadrement-filter/plaine-commune-filter'
import { closeDbConnections } from '@test-utils/website-test-harness'

afterAll(closeDbConnections)

const info = (over: Partial<InfoToFilter> = {}): InfoToFilter =>
  ({
    roomCount: 2,
    hasFurniture: null,
    postalCode: null,
    coordinates: null,
    blurryCoordinates: null,
    city: 'bordeaux',
    yearBuilt: null,
    isHouse: null,
    ...over,
  }) as unknown as InfoToFilter

const rent = (over: Partial<DefaultEncadrementItem> = {}): EncadrementItem =>
  ({
    zone: 1,
    nombre_de_piece: '2',
    annee_de_construction: 'avant 1946',
    prix_min: '10',
    prix_med: '12',
    prix_max: '15',
    meuble: false,
    ...over,
  }) as unknown as EncadrementItem

const zoneRow = (zone: string | number): ZoneDocument =>
  ({ properties: { zone } }) as unknown as ZoneDocument

// Plaine Commune et Est Ensemble portent la zone en majuscules dans le geojson.
const zoneRowUpper = (zone: string | number): ZoneDocument =>
  ({ properties: { Zone: zone } }) as unknown as ZoneDocument

/**
 * Le seul travail sale du FilterParent est l'accès disque (arrêté préfectoral)
 * et la base (géométrie des quartiers). On les remplace par des doubles, sans
 * toucher au reste : les cinq prédicats et la mise en forme sont bien le code
 * de production.
 */
class StubFilter extends FilterParent {
  districts: ZoneDocument[] = []
  catalogue: DefaultEncadrementItem[] = []

  constructor(mainCity: AvailableMainCities, over: Partial<InfoToFilter> = {}) {
    super(info(over))
    this.mainCity = mainCity
  }

  protected async districtsMatched(): Promise<Zone[]> {
    return this.districts as unknown as Zone[]
  }

  protected rangeRentsJson(): EncadrementItem[] {
    return this.catalogue as unknown as EncadrementItem[]
  }

  exposeCoordinate() {
    return this.getCoordinate()
  }
}

describe('FilterFactory — quel filtre pour quelle ville', () => {
  const build = (mainCity: string, over: Partial<InfoToFilter> = {}) =>
    new FilterFactory(mainCity as AvailableMainCities).currentEncadrementFilter(
      info(over),
    )

  it.each<[string, new (...args: never[]) => FilterParent]>([
    ['paris', ParisFilter],
    ['plaineCommune', PlaineCommuneFilter],
    ['estEnsemble', EstEnsembleFilter],
    ['grenoble', GrenobleFilter],
  ])('%s a son filtre dédié', (mainCity, expected) => {
    expect(build(mainCity)).toBeInstanceOf(expected)
  })

  it('lyon reste sur le filtre générique', () => {
    expect(build('lyon')).toBeInstanceOf(GenericFilter)
  })

  it('une ville sans arrêté reçoit le filtre factice', () => {
    expect(build('brest')).toBeInstanceOf(FakeFilter)
  })

  it('une ville réelle sans filtre dédié reçoit le filtre générique', () => {
    const filter = build('bordeaux')

    expect(filter).toBeInstanceOf(GenericFilter)
    expect(filter).not.toBeInstanceOf(FakeFilter)
  })
})

describe('GenericFilter — découpage temporel', () => {
  it('suit le zonage arrêté en 1990', () => {
    expect(new GenericFilter('bordeaux', info()).rangeTime).toEqual([
      'avant 1946',
      '1946-1970',
      '1971-1990',
      'apres 1990',
    ])
  })

  it('ajoute la tranche 1991-2005 quand le zonage va jusque-là', () => {
    expect(new GenericFilter('lyon', info()).rangeTime).toEqual([
      'avant 1946',
      '1946-1970',
      '1971-1990',
      '1991-2005',
      'apres 2005',
    ])
  })
})

describe('quel arrêté s’applique', () => {
  it('sans date, retient l’arrêté le plus récent', () => {
    expect(getJsonPath('paris', null)).toBe(
      'json-data/encadrements_paris_2026.json',
    )
  })

  it('avec une date, retient l’arrêté de la période couverte', () => {
    expect(getJsonPath('paris', new Date('2025-01-15'))).toBe(
      'json-data/encadrements_paris.json',
    )
  })

  it('avec une date au-delà de toutes les périodes closes, retombe sur le dernier', () => {
    expect(getJsonPath('paris', new Date('2030-01-01'))).toBe(
      'json-data/encadrements_paris_2026.json',
    )
  })

  it('utilise directement un arrêté sans bornes (période unique)', () => {
    expect(getJsonPath('brest', new Date('2026-01-01'))).toBe(
      'json-data/encadrements_brest_2024.json',
    )
  })

  it('refuse une ville sans aucun arrêté', () => {
    expect(() => getJsonPath('nowhere' as never, null)).toThrow()
  })
})

describe('FilterParent — les cinq prédicats', () => {
  const withDistricts = (
    over: Partial<InfoToFilter>,
    catalogue: Partial<DefaultEncadrementItem>[],
    districts: string[] = ['1'],
  ) => {
    const filter = new StubFilter('bordeaux', over)
    filter.districts = districts.map(zoneRow)
    filter.catalogue = catalogue.map((c) => rent(c)) as never

    return filter
  }

  it('écarte les barèmes d’une autre zone', async () => {
    const results = await withDistricts({}, [
      { zone: 1, prix_max: '15' },
      { zone: 2, prix_max: '99' },
    ]).filter()

    expect(results).toHaveLength(1)
    expect(results[0].maxPrice).toBe(15)
  })

  it('sans quartier identifié, aucun barème n’est retenu', async () => {
    const filter = withDistricts({}, [{ zone: 1 }], [])

    expect(await filter.filter()).toEqual([])
    expect(await filter.find()).toBeNull()
  })

  it.each([
    [2, '2', true],
    [2, '3', false],
    [5, '4 et plus', true],
    [5, '2', false],
  ])(
    'nombre de pièces %s face à « %s » → %s',
    async (roomCount, nombre_de_piece, expected) => {
      const results = await withDistricts({ roomCount }, [
        { zone: 1, nombre_de_piece },
      ]).filter()

      expect(results.length > 0).toBe(expected)
    },
  )

  it.each([
    [true, true, true],
    [true, false, false],
    [false, true, false],
    [false, false, true],
  ])(
    'meublé demandé %s face à un barème meublé=%s → %s',
    async (hasFurniture, meuble, expected) => {
      const results = await withDistricts({ hasFurniture }, [
        { zone: 1, meuble },
      ]).filter()

      expect(results.length > 0).toBe(expected)
    },
  )

  it.each([
    [true, true, true],
    [true, false, false],
    [false, true, false],
    [false, false, true],
  ])(
    'maison demandée %s face à un barème maison=%s → %s',
    async (isHouse, maison, expected) => {
      const results = await withDistricts({ isHouse }, [
        { zone: 1, maison },
      ]).filter()

      expect(results.length > 0).toBe(expected)
    },
  )

  it('un territoire sans maisons ignore le critère', async () => {
    const filter = withDistricts({ isHouse: true }, [
      { zone: 1, maison: false },
    ])
    filter.mainCity = 'lyon'

    expect(await filter.filter()).toHaveLength(1)
  })

  it('restreint aux barèmes de la tranche de construction de l’annonce', async () => {
    const results = await withDistricts({ yearBuilt: [1950] }, [
      { zone: 1, annee_de_construction: '1946-1970', prix_max: '15' },
      { zone: 1, annee_de_construction: 'avant 1946', prix_max: '99' },
    ]).filter()

    expect(results.map((r) => r.maxPrice)).toEqual([15])
  })

  it('sans année de construction connue, toutes les tranches passent', async () => {
    const results = await withDistricts({ yearBuilt: null }, [
      { zone: 1, annee_de_construction: 'avant 1946' },
      { zone: 1, annee_de_construction: '1946-1970' },
    ]).filter()

    expect(results).toHaveLength(2)
  })
})

describe('FilterParent — mise en forme du résultat', () => {
  const withCatalogue = (
    catalogue: Partial<DefaultEncadrementItem>[],
    over: Partial<InfoToFilter> = {},
  ) => {
    const filter = new StubFilter('bordeaux', over)
    filter.districts = [zoneRow('3')]
    filter.catalogue = catalogue.map((c) => rent({ zone: 3, ...c })) as never

    return filter
  }

  it('convertit les prix à virgule et nomme le quartier', async () => {
    const [result] = await withCatalogue(
      [
        {
          prix_min: '10,5',
          prix_med: '12,25',
          prix_max: '15,75',
          meuble: true,
          nombre_de_piece: '3',
          annee_de_construction: '1971-1990',
          maison: true,
        },
      ],
      { roomCount: 3 },
    ).filter()

    expect(result).toEqual({
      maxPrice: 15.75,
      refPrice: 12.25,
      minPrice: 10.5,
      districtName: 'Zone 3',
      isFurnished: true,
      roomCount: '3',
      yearBuilt: '1971-1990',
      isHouse: 'Maison',
    })
  })

  it('trie du plus ancien au plus récent', async () => {
    const results = await withCatalogue([
      { annee_de_construction: 'apres 1990' },
      { annee_de_construction: '1971-1990' },
      { annee_de_construction: 'avant 1946' },
    ]).filter()

    expect(results.map((r) => r.yearBuilt)).toEqual([
      'avant 1946',
      '1971-1990',
      'apres 1990',
    ])
  })

  it('find() retient le barème le plus cher (pire cas)', async () => {
    const filter = withCatalogue([
      { prix_max: '10' },
      { prix_max: '30' },
      { prix_max: '20' },
    ])

    expect((await filter.find()).maxPrice).toBe(30)
  })
})

describe('FilterParent — quelle position retenir', () => {
  const coordinate = (over: Partial<InfoToFilter>) =>
    new StubFilter('bordeaux', over).exposeCoordinate()

  it('préfère les coordonnées précises', () => {
    expect(
      coordinate({
        coordinates: { lat: 48.85, lng: 2.35 },
        blurryCoordinates: { lat: 48.8, lng: 2.3 },
      }),
    ).toEqual({ lat: 48.85, lng: 2.35 })
  })

  it('retombe sur les coordonnées floues', () => {
    expect(coordinate({ blurryCoordinates: { lat: 48.8, lng: 2.3 } })).toEqual({
      lat: 48.8,
      lng: 2.3,
    })
  })

  it('ignore des coordonnées partielles', () => {
    expect(
      coordinate({
        coordinates: { lat: 48.85, lng: null } as never,
        blurryCoordinates: { lat: 48.8, lng: 2.3 },
      }),
    ).toEqual({ lat: 48.8, lng: 2.3 })
  })

  it('renvoie null faute de position', () => {
    expect(coordinate({})).toBeNull()
  })
})

describe('FilterParent — tranches de libellé et d’années', () => {
  const filter = new StubFilter('bordeaux')

  it('traduit un libellé en bornes d’années', () => {
    expect(filter.rangeTimeToUniversalRangeTime('avant 1946')).toEqual([
      null,
      1946,
    ])
    expect(filter.rangeTimeToUniversalRangeTime('1971-1990')).toEqual([
      1971, 1990,
    ])
  })

  it('renvoie null pour un libellé inconnu', () => {
    expect(filter.rangeTimeToUniversalRangeTime('n’importe quoi')).toBeNull()
  })
})

describe('filtres territoriaux — reconnaissance de zone', () => {
  class GrenobleProbe extends GrenobleFilter {
    match(districts: ZoneDocument[], rangeRent: EncadrementItem) {
      return this.isDistrictMatch(districts, rangeRent)
    }
  }

  class PlaineCommuneProbe extends PlaineCommuneFilter {
    match(districts: ZoneDocument[], rangeRent: EncadrementItem) {
      return this.isDistrictMatch(districts, rangeRent as never)
    }
  }

  class EstEnsembleProbe extends EstEnsembleFilter {
    match(districts: ZoneDocument[], rangeRent: EncadrementItem) {
      return this.isDistrictMatch(districts, rangeRent as never)
    }
  }

  class ParisProbe extends ParisFilter {
    matchRoomCount(rangeRent: EncadrementItem) {
      return this.isRoomCountMatch(rangeRent as never)
    }
  }

  it('Grenoble accepte une zone alphabétique', async () => {
    const probe = new GrenobleProbe(info())

    expect(await probe.match([zoneRow('A')], { zone: 'A' } as never)).toBe(true)
    expect(await probe.match([zoneRow('2')], { zone: 2 } as never)).toBe(true)
    expect(await probe.match([zoneRow('B')], { zone: 'A' } as never)).toBe(
      false,
    )
    expect(await probe.match([], { zone: 1 } as never)).toBe(false)
  })

  it('Plaine Commune et Est Ensemble comparent la zone en nombre', async () => {
    for (const probe of [
      new PlaineCommuneProbe(info()),
      new EstEnsembleProbe(info()),
    ]) {
      expect(
        await probe.match([zoneRowUpper('2')], { zone: '2' } as never),
      ).toBe(true)
      expect(await probe.match([zoneRowUpper('2')], { zone: 4 } as never)).toBe(
        false,
      )
      expect(await probe.match([], { zone: 2 } as never)).toBe(false)
    }
  })

  it('Paris reconnaît le « 4 et plus » au libellé', async () => {
    const probe = new ParisProbe(info({ roomCount: 5 }))

    expect(await probe.matchRoomCount({ piece: '4 et plus' } as never)).toBe(
      true,
    )
    expect(await probe.matchRoomCount({ piece: 4 } as never)).toBe(false)
  })

  it('Paris compare le meublé au libellé du barème', async () => {
    const furnished = new ParisFilter(info({ hasFurniture: true }))
    const unfurnished = new ParisFilter(info({ hasFurniture: false }))

    expect(
      await furnished.isHasFurnitureMatch({ meuble_txt: 'meublé' } as never),
    ).toBe(true)
    expect(
      await furnished.isHasFurnitureMatch({
        meuble_txt: 'non meublé',
      } as never),
    ).toBe(false)
    expect(
      await unfurnished.isHasFurnitureMatch({
        meuble_txt: 'non meublé',
      } as never),
    ).toBe(true)
  })
})

describe('FilterParent — lecture de l’arrêté embarqué', () => {
  class FileFilter extends FilterParent {
    constructor(mainCity: AvailableMainCities, over: Partial<InfoToFilter>) {
      super(info(over))
      this.mainCity = mainCity
    }

    protected async districtsMatched(): Promise<Zone[]> {
      return []
    }

    exposeRents() {
      return this.rangeRentsJson()
    }
  }

  const fileFilter = () =>
    new FileFilter('bordeaux', { rentalStartDate: new Date('2023-01-01') })

  it('lit et analyse l’arrêté livré avec le code', () => {
    const rents = fileFilter().exposeRents()

    expect(rents.length).toBeGreaterThan(0)
    expect(rents[0]).toHaveProperty('prix_max')
    expect(rents[0]).toHaveProperty('zone')
  })

  it('ne relit pas le fichier à chaque appel', () => {
    const filter = fileFilter()

    expect(filter.exposeRents()).toBe(filter.exposeRents())
  })
})

describe('FakeFilter — repli sur l’observatoire des loyers', () => {
  class FakeProbe extends FakeFilter {
    districts: ZoneDocument[] = []
    catalogue: ObservatoireEncadrementItem[] = []

    constructor(over: Partial<InfoToFilter> = {}) {
      super('brest', info({ ...over, city: 'brest' as never }))
    }

    protected async districtsMatched(): Promise<Zone[]> {
      return this.districts as unknown as Zone[]
    }

    protected rangeRentsJson(): EncadrementItem[] {
      return this.catalogue as unknown as EncadrementItem[]
    }
  }

  const observatoire = (
    over: Partial<ObservatoireEncadrementItem> = {},
  ): ObservatoireEncadrementItem => ({
    Observatory: 'B2900',
    Data_year: '2024',
    agglomeration: 'L2900',
    zone: '1',
    Zone_calcul: 'L2900.1.01',
    Type_habitat: 'Appartement',
    epoque_construction_homogene: '',
    nombre_pieces_homogene: '',
    loyer_median: '9,0',
    loyer_median_max: '10.80',
    loyer_median_min: '7.50',
    nombre_observations: '148',
    ...over,
  })

  const build = (
    catalogue: Partial<ObservatoireEncadrementItem>[],
    over: Partial<InfoToFilter> = {},
  ) => {
    const filter = new FakeProbe(over)
    filter.districts = [zoneRow('1')]
    filter.catalogue = catalogue.map(observatoire)

    return filter
  }

  it('met en forme les loyers médians de l’observatoire', async () => {
    const [result] = await build([{}]).filter()

    expect(result).toEqual({
      maxPrice: 10.8,
      refPrice: 9,
      minPrice: 7.5,
      districtName: 'Zone 1',
      isFurnished: null,
      roomCount: '',
      yearBuilt: '',
      isHouse: null,
    })
  })

  it.each([
    ['1P', '1'],
    ['2P', '2'],
    ['4P', '4 et plus'],
    ['4P+', '4 et plus'],
    ['5P+', '5'],
    ['n’importe quoi', ''],
  ])('traduit « %s » en « %s »', async (nombre_pieces_homogene, expected) => {
    const [result] = await build([{ nombre_pieces_homogene }], {
      roomCount: null,
    }).filter()

    expect(result.roomCount).toBe(expected)
  })

  it('un barème sans nombre de pièces ne filtre rien', async () => {
    expect(await build([{}], { roomCount: 5 }).filter()).toHaveLength(1)
  })

  it('écarte les barèmes d’un autre nombre de pièces', async () => {
    const results = await build([{ nombre_pieces_homogene: '2P' }], {
      roomCount: 3,
    }).filter()

    expect(results).toEqual([])
  })

  it('range « 4 et plus » au-delà de trois pièces', async () => {
    const results = await build([{ nombre_pieces_homogene: '4P' }], {
      roomCount: 5,
    }).filter()

    expect(results).toHaveLength(1)
  })

  it('un barème sans ancienneté ne filtre rien', async () => {
    expect(await build([{}], { yearBuilt: [1950] }).filter()).toHaveLength(1)
  })

  it('respecte la tranche d’ancienneté quand elle est renseignée', async () => {
    const results = await build(
      [
        { epoque_construction_homogene: 'avant 1946' },
        { epoque_construction_homogene: '1946-1970' },
      ],
      { yearBuilt: [1950] },
    ).filter()

    expect(results.map((r) => r.yearBuilt)).toEqual(['1946-1970'])
  })

  it('ne filtre jamais sur le meublé, faute d’info à la source', async () => {
    const results = await build([{}], { hasFurniture: true }).filter()

    expect(results).toHaveLength(1)
    expect(results[0].isFurnished).toBeNull()
  })

  it.each([
    [true, 'Maison', true],
    [true, 'Appartement', false],
    [false, 'Appartement', true],
    [false, 'Maison', false],
    [null, 'Appartement', true],
  ])(
    'maison demandée %s face à un barème %s → %s',
    async (isHouse, Type_habitat, expected) => {
      const results = await build([{ Type_habitat }], { isHouse }).filter()

      expect(results.length > 0).toBe(expected)
    },
  )

  it('un barème sans type d’habitat ne filtre rien', async () => {
    const results = await build([{ Type_habitat: '' }], {
      isHouse: true,
    }).filter()

    expect(results).toHaveLength(1)
  })

  it('find() privilégie le barème le mieux renseigné avant le plus cher', async () => {
    const filter = build(
      [
        {
          nombre_pieces_homogene: '3P',
          epoque_construction_homogene: 'avant 1946',
          loyer_median_max: '20',
        },
        {
          nombre_pieces_homogene: '2P',
          epoque_construction_homogene: '',
          loyer_median_max: '100',
        },
      ],
      { roomCount: null },
    )

    expect((await filter.find()).maxPrice).toBe(20)
  })

  it('find() départage à score égal par le loyer le plus élevé', async () => {
    const filter = build(
      [
        {
          nombre_pieces_homogene: '3P',
          epoque_construction_homogene: 'avant 1946',
          loyer_median_max: '20',
        },
        {
          nombre_pieces_homogene: '2P',
          epoque_construction_homogene: 'avant 1946',
          loyer_median_max: '35',
        },
      ],
      { roomCount: null },
    )

    expect((await filter.find()).maxPrice).toBe(35)
  })

  it('find() renvoie null quand aucun barème ne correspond', async () => {
    expect(await build([]).find()).toBeNull()
  })
})

describe('ParisFilter — millésime, quartier et mise en forme', () => {
  class ParisProbe extends ParisFilter {
    catalogue: ParisEncadrementItem[] = []

    constructor(over: Partial<InfoToFilter> = {}) {
      super(info({ ...over, city: 'paris' as never }))
    }

    protected rangeRentsJson(): EncadrementItem[] {
      return this.catalogue as unknown as EncadrementItem[]
    }
  }

  // ParisFilter appelle super.districtsMatched(), qui court-circuite un simple
  // override : on intercepte donc la fabrique de quartiers pour rester
  // hors-ligne (sinon chaque test ouvre une requête Mongo sur les zones).
  let matchedDistricts: ZoneDocument[] = []
  let districtSpy: jest.SpyInstance

  beforeEach(() => {
    districtSpy = jest
      .spyOn(DistrictFilterFactory.prototype, 'currentDistrictFilter')
      .mockReturnValue({
        getDistricts: async () => matchedDistricts,
      } as never)
  })

  afterEach(() => districtSpy.mockRestore())

  // Le quartier 78 (Saint-Fargeau) appartient à la zone 13.
  const parisQuartier = (c_qu: number): ZoneDocument =>
    ({ properties: { c_qu } }) as unknown as ZoneDocument

  const parisRent = (
    over: Partial<ParisEncadrementItem> = {},
  ): ParisEncadrementItem => ({
    ville: 'PARIS',
    epoque: 'Avant 1946',
    id_zone: 13,
    meuble_txt: 'non meublé',
    max: 24.2,
    min: 14.1,
    piece: 2,
    ref: 20.2,
    annee: 2024,
    ...over,
  })

  const build = (
    catalogue: Partial<ParisEncadrementItem>[],
    over: Partial<InfoToFilter> = {},
    districts: ZoneDocument[] = [parisQuartier(78)],
  ) => {
    matchedDistricts = districts
    const filter = new ParisProbe(over)
    filter.catalogue = catalogue.map(parisRent)

    return filter
  }

  const in2024 = { rentalStartDate: new Date('2025-01-15') }

  it('retient le millésime de l’arrêté applicable début 2025', async () => {
    const results = await build(
      [
        { annee: 2024, max: 24.2 },
        { annee: 2025, max: 99 },
      ],
      in2024,
    ).filter()

    expect(results.map((r) => r.maxPrice)).toEqual([24.2])
  })

  it('bascule sur le nouveau millésime au 1er juillet', async () => {
    const results = await build(
      [
        { annee: 2024, max: 24.2 },
        { annee: 2025, max: 99 },
      ],
      { rentalStartDate: new Date('2025-08-15') },
    ).filter()

    expect(results.map((r) => r.maxPrice)).toEqual([99])
  })

  it('nomme le quartier via la table des zones parisiennes', async () => {
    const [result] = await build([{}], in2024).filter()

    expect(result.districtName).toBe('Saint-Fargeau')
  })

  it('écarte les barèmes d’une autre zone', async () => {
    const results = await build([{ id_zone: 1 }], in2024).filter()

    expect(results).toEqual([])
  })

  it('met en forme le barème parisien', async () => {
    const [result] = await build([{ meuble_txt: 'meublé' }], in2024).filter()

    expect(result).toEqual({
      maxPrice: 24.2,
      refPrice: 20.2,
      minPrice: 14.1,
      districtName: 'Saint-Fargeau',
      isFurnished: true,
      roomCount: '2',
      yearBuilt: 'Avant 1946',
    })
  })

  it('trie les époques selon le découpage parisien', async () => {
    const results = await build(
      [
        { epoque: 'Après 1990' },
        { epoque: '1971-1990' },
        { epoque: 'Avant 1946' },
      ],
      in2024,
    ).filter()

    expect(results.map((r) => r.yearBuilt)).toEqual([
      'Avant 1946',
      '1971-1990',
      'Après 1990',
    ])
  })
})
