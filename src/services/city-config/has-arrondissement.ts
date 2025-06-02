import { AvailableCities } from '@services/city-config/list'

export const hasArrondissement = (city: AvailableCities): boolean => {
  switch (city) {
    case 'paris':
    case 'lyon':
    case 'marseille':
      return true
    default:
      return false
  }
}