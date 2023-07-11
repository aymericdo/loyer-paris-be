import { AvailableMainCities } from '@services/address/city'

export const MORE_INFO: { [city in AvailableMainCities]: string } = {
  paris: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
  lyon: 'https://www.grandlyon.com/services/lencadrement-des-loyers-a-lyon-et-villeurbanne.html',
  lille: 'https://encadrement-loyers.lille.fr/',
  plaineCommune: 'https://plainecommune.fr/encadrementdesloyers/',
  estEnsemble: 'https://www.est-ensemble.fr/lencadrement-des-loyers-sera-applique-en-decembre-est-ensemble',
  montpellier:
    'https://www.montpellier3m.fr/lencadrement-des-loyers-entre-en-application-montpellier-compter-du-1er-juillet-2022',
  bordeaux:
    'https://www.bordeaux-metropole.fr/Vivre-habiter/Se-loger-et-habiter/Mettre-son-logement-en-location/Encadrement-des-loyers-a-Bordeaux',
}