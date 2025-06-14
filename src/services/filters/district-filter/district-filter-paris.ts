import { ParisDistrictItem, ParisDistrictItemProperties } from '@interfaces/paris'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { ParisGeojson } from '@db/db'
import { DistrictItemProperties } from '@interfaces/shared'

export class DistrictFilterParis extends DistrictFilterParent {
  GeojsonCollection = ParisGeojson
  mainCity: AvailableMainCities = 'paris'

  async getDistricts(): Promise<ParisDistrictItem[]> {
    return super.getDistricts() as Promise<ParisDistrictItem[]>
  }

  digCityInProperties(_data: ParisDistrictItemProperties): string {
    return 'paris'
  }

  digZoneInProperties(data: DistrictItemProperties): string {
    return (data as ParisDistrictItemProperties).l_qu
  }

  buildGroupBy(arrondissement: string): string {
    return `${arrondissement}${(+arrondissement > 1
      ? 'ème'
      : 'er'
    ).toString()} arrondissement`
  }

  protected async getDistrictsFromPostalCode(): Promise<ParisDistrictItem[]> {
    if (!this.postalCode) return []

    // 75010 -> 10  75009 -> 9
    const code = this.postalCode.slice(-2)[0] === '0' ? this.postalCode.slice(-1) : this.postalCode.slice(-2)
    const districts = await this.GeojsonCollection.find(
      {
        'properties.c_ar': +code
      },
    ).lean()

    return districts?.length ? districts as ParisDistrictItem[] : []
  }

  protected async getDistrictFromName(): Promise<ParisDistrictItem[]> {
    const districts = await this.GeojsonCollection.find(
      {
        'properties.l_qu': this.districtName
      },
    ).lean()

    return districts?.length ? districts as ParisDistrictItem[] : []
  }
}
