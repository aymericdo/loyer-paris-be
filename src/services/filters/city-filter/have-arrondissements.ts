import { AvailableCities } from '@services/filters/city-filter/city-list'

export const haveArrondissements = (city: AvailableCities): boolean => {
  switch (city) {
    case 'paris':
    case 'lyon':
      return true
    default:
      return false
  }
}