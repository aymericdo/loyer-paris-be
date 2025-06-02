import { AvailableMainCities } from '@services/city-config/list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { GrenobleGeojson } from '@db/db'
import { DefaultDistrictItem } from '@interfaces/shared'

export class DistrictFilterGrenoble extends DistrictFilterParent {
  GeojsonCollection = GrenobleGeojson
  mainCity: AvailableMainCities = 'grenoble'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  protected async getDistrictFromName(): Promise<DefaultDistrictItem[]> {
    const zone: string = this.districtName.match(/(?<=Zone ).*/g)[0]

    const filter = {
      'properties.zone': { $in: [zone] }
    }

    if (this.city) {
      filter['properties.NOM_COM'] = { $regex: this.city,  $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts : []
  }
}
