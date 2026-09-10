import { ZoneDocument } from '@db/zone.model'
import { closeDbConnections } from '@test-utils/website-test-harness'
import { Model } from 'mongoose'
import { DistrictFilterFactory } from '../district-filter-factory'
import { DistrictFilterParent } from '../district-filter-parent'
import { EstEnsembleDistrictFilter } from '../est-ensemble-district-filter'
import { GenericDistrictFilter } from '../generic-district-filter'
import { GrenobleDistrictFilter } from '../grenoble-district-filter'
import { ParisDistrictFilter } from '../paris-district-filter'
import { PlaineCommuneDistrictFilter } from '../plaine-commune-district-filter'

const zone = (properties: Record<string, unknown> = {}): ZoneDocument =>
  ({
    type: 'Feature',
    geometry: { type: 'MultiPolygon', coordinates: [] },
    properties: { city: 'lyon', zone: '1', ...properties },
  }) as unknown as ZoneDocument

/**
 * Double de la collection GeoJSON. `GeojsonCollection` est la couture
 * d'injection du filtre — on la remplace par un double pilotable plutôt que
 * d'interroger Mongo.
 *
 * Le double répond en fonction de la **première clé** du filtre Mongo, ce qui
 * permet de distinguer chaque stratégie (`properties.zone`,
 * `properties.postalCode`, `properties.city`, `properties.c_ar`, …). Une query
 * vide (`find({})`) est servie par la clé `$all`.
 */
const geojsonDouble = (
  rows: Record<string, ZoneDocument[]> = {},
  coordinate: ZoneDocument | null = null,
) => ({
  find: jest.fn((query: Record<string, unknown>) => ({
    lean: async () => {
      const keys = Object.keys(query)
      return keys.length === 0 ? (rows.$all ?? []) : (rows[keys[0]] ?? [])
    },
  })),
  findOne: jest.fn(() => ({ lean: async () => coordinate })),
})

const fakeCollection = jest.fn() as unknown as Model<ZoneDocument>

const buildFilter = (
  options: {
    coordinates?: { lat: number; lng: number }
    city?: never
    postalCode?: string
    districtName?: string
  },
  rows: Record<string, ZoneDocument[]> = {},
  coordinate: ZoneDocument | null = null,
) => {
  const filter = new GenericDistrictFilter('lyon', fakeCollection, options)
  filter.GeojsonCollection = geojsonDouble(
    rows,
    coordinate,
  ) as unknown as Model<ZoneDocument>
  return filter
}

describe('district-filter — quel quartier pour une annonce', () => {
  afterAll(closeDbConnections)

  describe('cascade de stratégies de DistrictFilterParent', () => {
    it('part du nom de quartier quand il est fourni', async () => {
      const expected = zone({ zone: '3' })
      const filter = buildFilter(
        { districtName: 'Zone 3' },
        { 'properties.zone': [expected] },
      )

      await expect(filter.getDistricts()).resolves.toEqual([expected])
      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.zone': '3',
      })
    })

    it('restreint le nom de quartier à la ville quand elle est connue', async () => {
      const filter = buildFilter(
        { districtName: 'Zone 3', city: 'villeurbanne' as never },
        { 'properties.zone': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.zone': '3',
        'properties.city': { $regex: 'villeurbanne', $options: 'i' },
      })
    })

    it('utilise la géométrie quand les coordonnées sont disponibles', async () => {
      const expected = zone()
      const filter = buildFilter(
        { coordinates: { lat: 45.75, lng: 4.85 } },
        {},
        expected,
      )

      await expect(filter.getDistricts()).resolves.toEqual([expected])
      expect(filter.GeojsonCollection.findOne).toHaveBeenCalledWith({
        geometry: {
          $geoIntersects: {
            $geometry: { type: 'Point', coordinates: [4.85, 45.75] },
          },
        },
      })
    })

    it('retombe sur le code postal si la géométrie ne trouve rien', async () => {
      const expected = zone({ postalCode: '69001' })
      const filter = buildFilter(
        { coordinates: { lat: 45.75, lng: 4.85 }, postalCode: '69001' },
        { 'properties.postalCode': [expected] },
        null,
      )

      await expect(filter.getDistricts()).resolves.toEqual([expected])
    })

    it('ignore des coordonnées incomplètes et passe au code postal', async () => {
      // lat à 0 est falsy : le filtre doit considérer la coordonnée comme absente
      const expected = zone()
      const filter = buildFilter(
        { coordinates: { lat: 0, lng: 4.85 }, postalCode: '69001' },
        { 'properties.postalCode': [expected] },
      )

      await expect(filter.getDistricts()).resolves.toEqual([expected])
      expect(filter.GeojsonCollection.findOne).not.toHaveBeenCalled()
    })

    it('retombe sur la ville si le code postal est absent', async () => {
      const expected = zone()
      const filter = buildFilter(
        { city: 'villeurbanne' as never },
        { 'properties.city': [expected] },
      )

      await expect(filter.getDistricts()).resolves.toEqual([expected])
    })

    it('retombe sur la main-city en dernier recours', async () => {
      const expected = zone()
      const filter = buildFilter({}, { $all: [expected] })

      await expect(filter.getDistricts()).resolves.toEqual([expected])
    })

    it('renvoie une liste vide si aucune stratégie ne trouve rien', async () => {
      const filter = buildFilter({})

      await expect(filter.getDistricts()).resolves.toEqual([])
    })

    it('interroge toute la collection pour une main-city à ville unique', async () => {
      const expected = zone()
      const filter = new GenericDistrictFilter('lille', fakeCollection, {
        city: 'lille' as never,
      })
      filter.GeojsonCollection = geojsonDouble({
        $all: [expected],
      }) as unknown as Model<ZoneDocument>

      await expect(filter.getDistricts()).resolves.toEqual([expected])
      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({})
    })

    it('getFirstDistrict renvoie le premier quartier trouvé', async () => {
      const first = zone({ zone: '1' })
      const second = zone({ zone: '2' })
      const filter = buildFilter({}, { $all: [first, second] })

      await expect(filter.getFirstDistrict()).resolves.toEqual(first)
    })
  })

  describe('extraction de la zone et de la ville', () => {
    it('digZoneInProperties numérote les zones numériques, préserve les autres', () => {
      const filter = buildFilter({})

      expect(filter.digZoneInProperties({ zone: '3' } as never)).toBe('Zone 3')
      expect(filter.digZoneInProperties({ zone: 'A' } as never)).toBe('Zone A')
    })

    it('digCityInProperties lit properties.city', () => {
      expect(
        buildFilter({}).digCityInProperties({ city: 'lyon' } as never),
      ).toBe('lyon')
    })

    it('buildGroupBy est neutre par défaut', () => {
      expect(buildFilter({}).buildGroupBy('3')).toBeNull()
    })
  })

  describe('DistrictFilterFactory — sélection du filtre', () => {
    // `GenericDistrictFilter` prend (mainCity, geojson, options) : une signature
    // de constructeur différente des autres, d'où le type élargi.
    type FilterConstructor = new (...args: never[]) => DistrictFilterParent

    it.each<[string, FilterConstructor]>([
      ['paris', ParisDistrictFilter],
      ['lyon', GenericDistrictFilter],
      ['grenoble', GrenobleDistrictFilter],
      ['plaineCommune', PlaineCommuneDistrictFilter],
      ['estEnsemble', EstEnsembleDistrictFilter],
    ])('%s', (mainCity, expected) => {
      const filter = new DistrictFilterFactory(
        mainCity as never,
      ).currentDistrictFilter({})

      expect(filter).toBeInstanceOf(expected)
      expect(filter.mainCity).toBe(mainCity)
    })
  })

  describe('Paris — arrondissements', () => {
    const buildParis = (options: {
      postalCode?: string
      districtName?: string
    }) => {
      const filter = new ParisDistrictFilter(options)
      filter.GeojsonCollection = geojsonDouble({
        'properties.c_ar': [zone()],
        'properties.l_qu': [zone()],
      }) as unknown as Model<ZoneDocument>
      return filter
    }

    it('nomme le 1er arrondissement au singulier', () => {
      expect(buildParis({}).buildGroupBy('1')).toBe('1er arrondissement')
    })

    it('nomme les autres arrondissements au pluriel', () => {
      expect(buildParis({}).buildGroupBy('2')).toBe('2ème arrondissement')
      expect(buildParis({}).buildGroupBy('12')).toBe('12ème arrondissement')
    })

    it('extrait le quartier de l_qu et fige la ville à paris', () => {
      const filter = buildParis({})

      expect(filter.digZoneInProperties({ l_qu: 'Gare' } as never)).toBe('Gare')
      expect(filter.digCityInProperties({} as never)).toBe('paris')
    })

    it('déduit le numéro d’arrondissement du code postal', async () => {
      const withZero = buildParis({ postalCode: '75009' })
      await withZero.getDistricts()

      expect(withZero.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.c_ar': 9,
      })

      const withoutZero = buildParis({ postalCode: '75010' })
      await withoutZero.getDistricts()

      expect(withoutZero.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.c_ar': 10,
      })
    })
  })

  describe('sous-classes — particularités de terrain', () => {
    it('Grenoble accepte des zones alphabétiques', async () => {
      const filter = new GrenobleDistrictFilter({ districtName: 'Zone A' })
      filter.GeojsonCollection = geojsonDouble({
        'properties.zone': [zone({ zone: 'A' })],
      }) as unknown as Model<ZoneDocument>

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.zone': 'A',
      })
    })

    it('Plaine Commune et Est Ensemble lisent la zone en majuscules', () => {
      expect(
        new PlaineCommuneDistrictFilter({}).digZoneInProperties({
          Zone: '2',
        } as never),
      ).toBe('Zone 2')
      expect(
        new EstEnsembleDistrictFilter({}).digZoneInProperties({
          Zone: '1',
        } as never),
      ).toBe('Zone 1')
    })

    it('Plaine Commune et Est Ensemble lisent la commune dans NOM_COM', () => {
      expect(
        new PlaineCommuneDistrictFilter({}).digCityInProperties({
          NOM_COM: 'Saint-Denis',
        } as never),
      ).toBe('Saint-Denis')
      expect(
        new EstEnsembleDistrictFilter({}).digCityInProperties({
          NOM_COM: 'Bagnolet',
        } as never),
      ).toBe('Bagnolet')
    })
  })

  describe('intercommunalités — requêtes Mongo', () => {
    const withDouble = <T extends DistrictFilterParent>(
      filter: T,
      rows: Record<string, ZoneDocument[]>,
    ) => {
      filter.GeojsonCollection = geojsonDouble(
        rows,
      ) as unknown as Model<ZoneDocument>
      return filter
    }

    it('Plaine Commune cible properties.Zone par son numéro', async () => {
      const filter = withDouble(
        new PlaineCommuneDistrictFilter({ districtName: 'Zone 2' }),
        { 'properties.Zone': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.Zone': '2',
      })
    })

    it('Plaine Commune compare CODE_POST en nombre', async () => {
      const filter = withDouble(
        new PlaineCommuneDistrictFilter({ postalCode: '93380' }),
        { 'properties.CODE_POST': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.CODE_POST': 93380,
      })
    })

    it('Plaine Commune filtre la commune via NOM_COM', async () => {
      const filter = withDouble(
        new PlaineCommuneDistrictFilter({ city: 'saint-denis' }),
        { 'properties.NOM_COM': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.NOM_COM': { $regex: 'saint-denis', $options: 'i' },
      })
    })

    it('Est Ensemble cible properties.Zone par son numéro', async () => {
      const filter = withDouble(
        new EstEnsembleDistrictFilter({ districtName: 'Zone 1' }),
        { 'properties.Zone': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.Zone': '1',
      })
    })

    it('Est Ensemble compare CODE_POST en chaîne', async () => {
      const filter = withDouble(
        new EstEnsembleDistrictFilter({ postalCode: '93100' }),
        { 'properties.CODE_POST': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.CODE_POST': '93100',
      })
    })

    it('Est Ensemble filtre la commune via NOM_COM', async () => {
      const filter = withDouble(
        new EstEnsembleDistrictFilter({ city: 'bagnolet' }),
        { 'properties.NOM_COM': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.NOM_COM': { $regex: 'bagnolet', $options: 'i' },
      })
    })

    it('Paris cherche le quartier par son libellé l_qu', async () => {
      const filter = withDouble(
        new ParisDistrictFilter({ districtName: 'Zone 5' }),
        { 'properties.l_qu': [zone()] },
      )

      await filter.getDistricts()

      expect(filter.GeojsonCollection.find).toHaveBeenCalledWith({
        'properties.l_qu': 'Zone 5',
      })
    })
  })
})
