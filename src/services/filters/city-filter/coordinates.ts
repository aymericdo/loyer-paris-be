import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export const coordinates = (city: AvailableMainCities): [number, number] => {
  switch (city) {
    case 'paris': return [48.866667, 2.333333]
    case 'lille': return [50.62925, 3.057256]
    case 'plaineCommune': return [48.9246404, 2.3625964]
    case 'estEnsemble': return [48.86415, 2.44322]
    case 'lyon': return [45.7578137, 4.8320114]
    case 'montpellier': return [43.6112422, 3.8767337]
    case 'bordeaux': return [44.841225, -0.5800364]
    default: return [46.2513662, 4.755835]
  }
}
