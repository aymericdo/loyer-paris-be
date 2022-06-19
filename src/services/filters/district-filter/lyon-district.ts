import { AvailableMainCities } from '@services/address/city'
import { LyonAddressItem } from '@interfaces/json-item-lyon'
import { DistrictFilterParent } from './district-filter-parent'

export class LyonDistrictService extends DistrictFilterParent {
  city: AvailableMainCities = 'lyon'

  getDistricts(): LyonAddressItem[] {
    return super.getDistricts() as LyonAddressItem[]
  }

  protected getDistrictFromName(): LyonAddressItem[] {
    return (this.getDistrictsJson() as LyonAddressItem[]).filter((district) => {
      return +district.properties.zonage === +this.districtName.match(/\d+/)[0]
    })
  }

  protected getDistrictFromPostalCode(): LyonAddressItem[] {
    if (this.postalCode) {
      return (this.getDistrictsJson() as LyonAddressItem[]).filter((district) => {
        return (
          this.getPostalCode(district.properties.commune) === this.postalCode
        )
      })
    } else {
      return []
    }
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
