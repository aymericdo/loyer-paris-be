import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './district-filter-parent'
import { GrenobleGeojson } from '@db/db'
import { ZoneDocument } from '@db/zone.model'

export class GrenobleDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = GrenobleGeojson
  mainCity: AvailableMainCities = 'grenoble'

  async getDistricts(): Promise<ZoneDocument[]> {
    return super.getDistricts() as Promise<ZoneDocument[]>
  }

  protected async getDistrictFromName(): Promise<ZoneDocument[]> {
    // Need to customize Grenoble because for some reasons, Zone can be A (yea I know.)
    const zone: string = this.districtName.match(/(?<=Zone ).*/g)[0]

    const filter = {
      'properties.zone': zone
    }

    if (this.city) {
      filter['properties.NOM_COM'] = { $regex: this.city,  $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts as ZoneDocument[] : []
  }
}
