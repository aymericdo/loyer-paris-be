import { getCityList, label, zones } from '@services/city-config/city-selectors'
import {
  DISPLAY_CITY_FIELD,
  DISPLAY_MAIN_CITY_FIELD,
  DISPLAY_ZONE_FIELD,
  DistrictsList,
} from '@services/districts/districts-list'
import { DistrictFilterFactory } from '@services/filters/district-filter/district-filter-factory'
import { closeDbConnections } from '@test-utils/website-test-harness'

afterAll(closeDbConnections)
afterEach(() => jest.restoreAllMocks())

const zone = (properties: object = {}) => ({
  type: 'Feature',
  geometry: { type: 'Polygon', coordinates: [] },
  properties: {
    city: 'Paris',
    codeInsee: '75011',
    zone: 'Zone 1',
    ...properties,
  },
})

/** Double du filtre de quartiers, seule couture Mongo du fichier. */
const withFilter = (over: object = {}) => {
  const filter = {
    getDistricts: jest.fn().mockResolvedValue([]),
    getFirstDistrict: jest.fn().mockResolvedValue(null),
    digZoneInProperties: jest.fn().mockReturnValue('Zone sondée'),
    digCityInProperties: jest.fn().mockReturnValue('Ville sondée'),
    buildGroupBy: jest.fn(
      (arrondissement: string) => `groupe ${arrondissement}`,
    ),
    ...over,
  }
  jest
    .spyOn(DistrictFilterFactory.prototype, 'currentDistrictFilter')
    .mockReturnValue(filter as never)
  return filter
}

describe('DistrictsList.currentGeodata', () => {
  it('emballe les zones en FeatureCollection', async () => {
    withFilter({ getDistricts: jest.fn().mockResolvedValue([zone(), zone()]) })

    const geodata = await new DistrictsList('paris').currentGeodata()

    expect(geodata.type).toBe('FeatureCollection')
    expect(geodata.features).toHaveLength(2)
  })

  it('conserve la géométrie et les propriétés d’origine', async () => {
    withFilter({
      getDistricts: jest
        .fn()
        .mockResolvedValue([
          zone({ zone: 'Saint-Fargeau', codeInsee: '75020' }),
        ]),
    })

    const [feature] = (await new DistrictsList('paris').currentGeodata())
      .features

    expect(feature.geometry).toEqual({ type: 'Polygon', coordinates: [] })
    expect(feature.properties).toMatchObject({
      zone: 'Saint-Fargeau',
      codeInsee: '75020',
    })
  })

  it('ajoute la zone, la ville et la ville principale aux propriétés', async () => {
    const filter = withFilter({
      getDistricts: jest.fn().mockResolvedValue([zone()]),
    })

    const [feature] = (
      await new DistrictsList('paris', {
        specificCity: 'paris',
        specificDistrict: 'Saint-Fargeau',
      }).currentGeodata()
    ).features

    expect(feature.properties[DISPLAY_ZONE_FIELD]).toBe('Zone sondée')
    expect(feature.properties[DISPLAY_CITY_FIELD]).toBe('Ville sondée')
    expect(feature.properties[DISPLAY_MAIN_CITY_FIELD]).toBe(label('paris'))
    expect(feature.properties.isFake).toBe(false)
    expect(filter.digZoneInProperties).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Paris' }),
    )
  })

  it('annonce une ville d’essai comme telle', async () => {
    withFilter({ getDistricts: jest.fn().mockResolvedValue([zone()]) })

    const [feature] = (await new DistrictsList('brest').currentGeodata())
      .features

    expect(feature.properties.isFake).toBe(true)
    expect(feature.properties[DISPLAY_MAIN_CITY_FIELD]).toBe('Brest')
  })

  it('rend une collection vide quand il n’y a pas de zone', async () => {
    withFilter()

    const geodata = await new DistrictsList('paris').currentGeodata()

    expect(geodata.features).toEqual([])
  })
})

describe('DistrictsList.currentFeature', () => {
  it('rend la première zone telle quelle', async () => {
    const first = zone()
    const filter = withFilter({
      getFirstDistrict: jest.fn().mockResolvedValue(first),
    })

    await expect(new DistrictsList('paris').currentFeature()).resolves.toBe(
      first,
    )
    expect(filter.getFirstDistrict).toHaveBeenCalledTimes(1)
  })
})

describe('DistrictsList.districtElemWithGroupBy — zones simples', () => {
  it('étiquette chaque zone de la ville', async () => {
    withFilter()

    const elems = await new DistrictsList('lille').districtElemWithGroupBy()

    expect(elems).toHaveLength(5)
    expect(elems[0]).toEqual({
      value: 'Zone 1',
      label: 'Lille (Zone 1)',
      displaySequence: 'Lille (Zone 1)',
      groupBy: null,
    })
  })

  it('ne demande aucun regroupement', async () => {
    const filter = withFilter()

    await new DistrictsList('lille').districtElemWithGroupBy()

    expect(filter.buildGroupBy).not.toHaveBeenCalled()
  })
})

describe('DistrictsList.districtElemWithGroupBy — zones par arrondissement', () => {
  it('regroupe les quartiers par arrondissement', async () => {
    withFilter()

    const elems = await new DistrictsList('paris').districtElemWithGroupBy()

    expect(elems[0]).toEqual({
      value: 'Palais-Royal',
      label: 'Palais-Royal',
      displaySequence: '1',
      groupBy: 'groupe 1',
    })
  })

  it('appelle le regroupement une fois par quartier', async () => {
    const filter = withFilter()

    const elems = await new DistrictsList('paris').districtElemWithGroupBy()

    expect(elems).toHaveLength(80)
    // L'appel siège dans la boucle interne, alors que l'arrondissement y est
    // invariant : 80 appels pour 20 arrondissements distincts.
    expect(filter.buildGroupBy).toHaveBeenCalledTimes(80)
    expect(
      new Set(
        filter.buildGroupBy.mock.calls.map(
          ([arrondissement]) => arrondissement,
        ),
      ),
    ).toHaveProperty('size', 20)
    expect(filter.buildGroupBy).toHaveBeenCalledWith('20')
  })
})

describe('DistrictsList.districtElemWithGroupBy — limite', () => {
  it('rend une liste vide quand ni la ville ni l’agglomération n’ont de zones', async () => {
    withFilter()

    const elems = await new DistrictsList('plaineCommune', {
      specificCity: 'plaineCommune' as never,
    }).districtElemWithGroupBy()

    expect(elems).toEqual([])
  })
})

// CONSTAT D'AUDIT — « aix-en-provence » figure dans la liste des villes de
// Marseille mais n'a aucune fiche dans classic-cities.json. zones() rend donc
// undefined et le repli prend les zones de l'agglomération, c'est-à-dire les
// arrondissements de Marseille. L'endpoint des quartiers sert alors deux fois
// chaque arrondissement marseillais.
describe('[constat] DistrictsList — la duplication marseillaise', () => {
  const marseilleArrondissementZones = Object.values(
    zones('marseille') as Record<string, string[]>,
  ).flat()

  it('déclare « aix-en-provence » dans Marseille sans lui donner de zones', () => {
    expect(getCityList('marseille')).toContain('aix-en-provence')
    expect(zones('aix-en-provence' as never)).toBeUndefined()
  })

  it('sert deux fois les arrondissements de Marseille', async () => {
    withFilter()

    const elems = await new DistrictsList('marseille').districtElemWithGroupBy()
    const parArrondissement = elems.filter((elem) => elem.groupBy !== null)

    expect(parArrondissement).toHaveLength(
      marseilleArrondissementZones.length * 2,
    )
  })

  it('atteint 300 entrées pour 205 attendues', async () => {
    withFilter()

    const elems = await new DistrictsList('marseille').districtElemWithGroupBy()

    expect(elems).toHaveLength(300)
  })
})
