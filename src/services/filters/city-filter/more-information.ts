import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'

export const getInfoLink = (mainCity: AvailableMainCities): string => {
  switch (mainCity) {
    case 'paris': return 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712'
    case 'lyon': return 'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html'
    case 'lille': return 'https://www.lille.fr/Vivre-a-Lille/Mon-logement/L-encadrement-des-loyers'
    case 'plaineCommune': return 'https://plainecommune.fr/encadrementdesloyers/'
    case 'estEnsemble': return 'https://www.est-ensemble.fr/lencadrement-des-loyers-sera-applique-en-decembre-est-ensemble'
    case 'montpellier': return 'https://www.montpellier3m.fr/lencadrement-des-loyers-entre-en-application-montpellier-compter-du-1er-juillet-2022'
    case 'bordeaux': return 'https://www.bordeaux-metropole.fr/Vivre-habiter/Se-loger-et-habiter/Mettre-son-logement-en-location/Encadrement-des-loyers-a-Bordeaux'
    default: return null
  }
}