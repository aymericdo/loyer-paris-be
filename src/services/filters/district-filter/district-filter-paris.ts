import { ParisDistrictItem } from '@interfaces/paris'
import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { ParisGeojson } from '@db/db'
import { AddressItemDB, DefaultAddressItemDB, DistrictItem } from '@interfaces/shared'

export class ParisDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = ParisGeojson
  mainCity: AvailableMainCities = 'paris'

  async getDistricts(): Promise<ParisDistrictItem[]> {
    return super.getDistricts() as Promise<ParisDistrictItem[]>
  }

  digZoneInProperties(data: unknown): string {
    return data['l_qu']
  }

  buildItem(district: DistrictItem, elem: AddressItemDB): DefaultAddressItemDB {
    return {
      ...elem,
      districtName: district ? this.digZoneInProperties(district['properties']) : null,
    } as DefaultAddressItemDB
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

    return districts?.length ? districts : []
  }

  protected async getDistrictFromName(): Promise<ParisDistrictItem[]> {
    const districts = await this.GeojsonCollection.find(
      {
        'properties.l_qu': this.districtName
      },
    ).lean()

    return districts?.length ? districts : []
  }
}
