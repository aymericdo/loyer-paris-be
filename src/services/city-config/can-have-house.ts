import { AvailableMainCities } from '@services/city-config/list'

export const canHaveHouse = (city: AvailableMainCities): boolean => {
  // https://www.youtube.com/watch?v=TuxMwALL_S4&ab_channel=Charted
  switch (city) {
    case 'plaineCommune':
    case 'estEnsemble':
    case 'bordeaux':
    case 'paysBasque':
      return true
    default:
      return false
  }
}