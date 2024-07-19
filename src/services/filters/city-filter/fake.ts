import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export const isFake = (city: AvailableMainCities): boolean => {
  switch (city) {
    case 'la rochelle':
      // nice, nantes, strasbourg, grenoble, rennes, toulon, tours, annecy
      return true
    default:
      return false
  }
}