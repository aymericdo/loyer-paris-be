import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { LyonGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'

export class LyonDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = LyonGeojson
  city: AvailableMainCities = 'lyon'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  private getPostalCode(cityName: string): string {
    switch (cityName) {
      case 'Villeurbanne':
        return '69100'
      case 'Lyon 1er Arrondissement':
        return '69001'
      case 'Lyon 2e Arrondissement':
        return '69002'
      case 'Lyon 3e Arrondissement':
        return '69003'
      case 'Lyon 4e Arrondissement':
        return '69004'
      case 'Lyon 5e Arrondissement':
        return '69005'
      case 'Lyon 6e Arrondissement':
        return '69006'
      case 'Lyon 7e Arrondissement':
        return '69007'
      case 'Lyon 8e Arrondissement':
        return '69008'
      case 'Lyon 9e Arrondissement':
        return '69009'
    }
  }
}
