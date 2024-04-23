import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/address/city'
import { DistrictFilterParent } from './district-filter-parent'
import { PlaineCommuneDistrictItem } from '@interfaces/json-item-plaine-commune'
import { PlaineCommuneGeojson } from '@db/db'

export class PlaineCommuneDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = PlaineCommuneGeojson
  city: AvailableMainCities = 'plaineCommune'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictsFromPostalCode(): Promise<PlaineCommuneDistrictItem[]> {
    if (!this.postalCode) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.CODE_POST': +this.postalCode
      },
    )
    return districts?.length ? districts : []
  }
}
