import {
  DATE_RANGE_END_IN_1990,
  DATE_RANGE_END_IN_2005,
  DateRange,
  YearBuiltService,
} from '@services/helpers/year-built'
import { closeDbConnections } from '@test-utils/website-test-harness'

const RANGE_2005 = [
  'avant 1946',
  '1946-1970',
  '1971-1990',
  '1991-2005',
  'apres 2005',
]
const RANGE_1990 = ['avant 1946', '1946-1970', '1971-1990', 'apres 1990']

const service = (rangeTime: string[], universal: readonly DateRange[]) =>
  new YearBuiltService(rangeTime, universal as unknown as [number, number][])

const endIn2005 = service(RANGE_2005, DATE_RANGE_END_IN_2005)
const endIn1990 = service(RANGE_1990, DATE_RANGE_END_IN_1990)

afterAll(closeDbConnections)

describe('getDateRangeFromYearBuilt', () => {
  it('ne tranche rien sans année connue', () => {
    expect(endIn2005.getDateRangeFromYearBuilt(null)).toBeNull()
  })

  it.each([
    [[1950], ['1946-1970']],
    [[1990], ['1971-1990']],
    [[1930], ['avant 1946']],
    [[2010], ['apres 2005']],
  ])('une année unique %j tombe dans %j', (yearBuilt, expected) => {
    expect(endIn2005.getDateRangeFromYearBuilt(yearBuilt)).toEqual(expected)
  })

  it('une borne haute seule couvre tout l’avant', () => {
    expect(endIn2005.getDateRangeFromYearBuilt([null, 1946])).toEqual([
      'avant 1946',
    ])
  })

  it('une borne basse seule couvre tout l’après', () => {
    expect(endIn2005.getDateRangeFromYearBuilt([1990, null])).toEqual([
      '1991-2005',
      'apres 2005',
    ])
  })

  it('deux bornes couvrent l’intervalle complet', () => {
    expect(endIn2005.getDateRangeFromYearBuilt([1950, 1970])).toEqual([
      '1946-1970',
    ])
  })

  it('respecte la borne haute de la ville', () => {
    expect(endIn1990.getDateRangeFromYearBuilt([2020, null])).toEqual([
      'apres 1990',
    ])
  })
})

describe('formatAsYearBuilt', () => {
  it('traduit le marqueur -1 en année ouverte', () => {
    expect(YearBuiltService.formatAsYearBuilt('-1')).toEqual([-1, null])
  })

  it('lit un intervalle à deux bornes', () => {
    expect(YearBuiltService.formatAsYearBuilt('1946,1970')).toEqual([
      1946, 1970,
    ])
  })
})

describe('formatAfterBeforeWord', () => {
  it.each([
    ['apres 1990', 'Après 1990'],
    ['avant 1946', 'Avant 1946'],
    ['APRES 1990', 'Après 1990'],
  ])('met en forme « %s »', (input, expected) => {
    expect(YearBuiltService.formatAfterBeforeWord(input)).toBe(expected)
  })
})

describe('getDisplayableYearBuilt', () => {
  it('ne produit rien sans période', () => {
    expect(YearBuiltService.getDisplayableYearBuilt(null)).toBeNull()
  })

  it.each([
    [[null, 1946], 'Avant 1946'],
    [[1990, null], 'Après 1990'],
    [[1946, 1970], '1946-1970'],
    [[1960], '1960'],
  ])('met en forme %j en « %s »', (periodBuilt, expected) => {
    expect(YearBuiltService.getDisplayableYearBuilt(periodBuilt)).toBe(expected)
  })
})

describe('getYearBuiltFromBuilding', () => {
  it('privilégie l’année de construction exacte', () => {
    expect(
      YearBuiltService.getYearBuiltFromBuilding({
        properties: { an_const: '1975', c_perconst: 'avant 1946' },
      }),
    ).toEqual([1975])
  })

  it('n’extrait rien d’un bâtiment absent', () => {
    expect(YearBuiltService.getYearBuiltFromBuilding(null)).toBeNull()
  })

  it.each([
    ['avant 1946', [null, 1946]],
    ['apres 1990', [1990, null]],
    ['1946-1970', [1946, 1970]],
  ])('traduit la période de construction « %s »', (c_perconst, expected) => {
    expect(
      YearBuiltService.getYearBuiltFromBuilding({ properties: { c_perconst } }),
    ).toEqual(expected)
  })
})
