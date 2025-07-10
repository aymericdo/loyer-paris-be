import { InfoToFilter } from '@interfaces/ad'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { FakeFilter } from '@services/filters/encadrement-filter/fake-filter'
import { GrenobleFilter } from '@services/filters/encadrement-filter/grenoble-filter'
import { EstEnsembleFilter } from './est-ensemble-filter'
import { GenericFilter } from './generic-filter'
import { ParisFilter } from './paris-filter'
import { PlaineCommuneFilter } from './plaine-commune-filter'

export class FilterFactory {
  mainCity: AvailableMainCities

  private genericConfigs: Partial<Record<AvailableMainCities, string>> = {
    paysBasque: 'json-data/encadrements_pays-basque_2024.json',
    bordeaux: 'json-data/encadrements_bordeaux_2025.json',
    lille: 'json-data/encadrements_lille_2025.json',
    lyon: 'json-data/encadrements_lyon_2024.json',
    montpellier: 'json-data/encadrements_montpellier_2025.json',
  }

  private fakeCityConfigs: Partial<Record<AvailableMainCities, string>> = {
    brest: 'json-data/encadrements_brest_2024.json',
    toulouse: 'json-data/encadrements_toulouse_2024.json',
    'saint-malo': 'json-data/encadrements_saint-malo_2023.json',
    alençon: 'json-data/encadrements_alençon_2023.json',
    'la rochelle': 'json-data/encadrements_la-rochelle_2023.json',
    rennes: 'json-data/encadrements_rennes_2023.json',
    toulon: 'json-data/encadrements_toulon_2024.json',
    annecy: 'json-data/encadrements_annecy_2023.json',
    marseille: 'json-data/encadrements_marseille_2023.json',
    nice: 'json-data/encadrements_nice_2023.json',
    nantes: 'json-data/encadrements_nantes_2023.json',
    strasbourg: 'json-data/encadrements_strasbourg_2024.json',
    nancy: 'json-data/encadrements_nancy_2023.json',
    tours: 'json-data/encadrements_tours_2023.json',
    arras: 'json-data/encadrements_arras_2023.json',
    vannes: 'json-data/encadrements_vannes_2024.json',
    'clermont-ferrand': 'json-data/encadrements_clermont-ferrand_2023.json',
    bastia: 'json-data/encadrements_bastia_2023.json',
    ajaccio: 'json-data/encadrements_ajaccio_2023.json',
    arles: 'json-data/encadrements_arles_2023.json',
    fréjus: 'json-data/encadrements_fréjus_2024.json',
  }

  constructor(mainCity: AvailableMainCities) {
    this.mainCity = mainCity
  }

  currentEncadrementFilter(infoToFilter: InfoToFilter) {
    if (Object.keys(this.genericConfigs).includes(this.mainCity)) {
      const jsonPath = this.genericConfigs[this.mainCity]
      return new GenericFilter(this.mainCity, jsonPath, infoToFilter)
    } else if (Object.keys(this.fakeCityConfigs).includes(this.mainCity)) {
      const jsonPath = this.fakeCityConfigs[this.mainCity]
      return new FakeFilter(this.mainCity, jsonPath, infoToFilter)
    }

    switch (this.mainCity) {
      case 'paris':
        return new ParisFilter(infoToFilter)
      case 'plaineCommune':
        return new PlaineCommuneFilter(infoToFilter)
      case 'estEnsemble':
        return new EstEnsembleFilter(infoToFilter)
      case 'grenoble':
        return new GrenobleFilter(infoToFilter)
    }
  }
}
