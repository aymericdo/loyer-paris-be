import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export const dateBuiltRange = (city: AvailableMainCities): [number, number][] => {
  switch (city) {
    case 'lyon':
    case 'montpellier':
      return [[null, 1946], [1946, 1970], [1971, 1990], [1991, 2005], [2005, null]]
    default:
      return [[null, 1946], [1946, 1970], [1971, 1990], [1990, null]]
  }
}
