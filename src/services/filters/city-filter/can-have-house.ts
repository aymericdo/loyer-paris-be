import { AvailableMainCities } from '@services/filters/city-filter/city-list'

export const canHaveHouse = (city: AvailableMainCities): boolean => {
  // https://www.youtube.com/watch?v=TuxMwALL_S4&ab_channel=Charted
  switch (city) {
    case 'plaineCommune':
    case 'estEnsemble':
    case 'bordeaux':
      return true
    default:
      return false
  }
}