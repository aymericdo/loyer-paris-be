import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export const isFake = (city: AvailableMainCities): boolean => {
  switch (city) {
    case 'la rochelle':
    case 'annecy':
      // nice, nantes, strasbourg, grenoble, rennes, toulon, tours
      return true
    default:
      return false
  }
}