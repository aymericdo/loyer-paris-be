import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export const isFake = (city: AvailableMainCities): boolean => {
  switch (city) {
    case 'annecy':
    case 'la rochelle':
    case 'marseille':
    case 'nice':
    case 'nantes':
    case 'strasbourg':
    case 'rennes':
    case 'toulon':
    case 'toulouse':
    case 'aix-en-provence':
      return true
    default:
      return false
  }
}
