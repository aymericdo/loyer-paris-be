import { DistrictItemProperties } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/main-cities'
import { DistrictFilterParent } from './district-filter-parent'
import { PlaineCommuneDistrictItemProperties } from '@interfaces/plaine-commune'
import { PlaineCommuneGeojson } from '@db/db'
import { ZoneDocument } from '@db/zone.model'

export class PlaineCommuneDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = PlaineCommuneGeojson
  mainCity: AvailableMainCities = 'plaineCommune'

  async getDistricts(): Promise<ZoneDocument[]> {
    return super.getDistricts() as Promise<ZoneDocument[]>
  }

  digZoneInProperties(data: DistrictItemProperties): string {
    return `Zone ${(data as PlaineCommuneDistrictItemProperties).Zone}`
  }

  digCityInProperties(data: PlaineCommuneDistrictItemProperties): string {
    return data.NOM_COM
  }

  protected async getDistrictFromName(): Promise<ZoneDocument[]> {
    const zone: number = +this.districtName.match(/\d+/)[0]

    const filter = {
      'properties.Zone': zone.toString(),
    }

    if (this.city) {
      filter['properties.NOM_COM'] = { $regex: this.city, $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromPostalCode(): Promise<ZoneDocument[]> {
    if (!this.postalCode) return []

    const districts = await this.GeojsonCollection.find({
      'properties.CODE_POST': +this.postalCode,
    }).lean()
    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<ZoneDocument[]> {
    if (!this.city) return []

    const districts = await this.GeojsonCollection.find({
      'properties.NOM_COM': { $regex: this.city, $options: 'i' },
    }).lean()

    return districts?.length ? districts : []
  }
}
