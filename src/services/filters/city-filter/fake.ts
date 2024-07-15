import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export const isFake = (city: AvailableMainCities): boolean => {
  switch (city) {
    case 'la rochelle':
      return true
    default:
      return false
  }
}