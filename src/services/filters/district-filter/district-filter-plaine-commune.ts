import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { PlaineCommuneDistrictItem, PlaineCommuneDistrictItemProperties } from '@interfaces/plaine-commune'
import { PlaineCommuneGeojson } from '@db/db'

export class DistrictFilterPlaineCommune extends DistrictFilterParent {
  GeojsonCollection = PlaineCommuneGeojson
  mainCity: AvailableMainCities = 'plaineCommune'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  digZoneInProperties(data: PlaineCommuneDistrictItemProperties): string {
    return `Zone ${data.Zone}`
  }

  digCityInProperties(data: PlaineCommuneDistrictItemProperties): string {
    return data.NOM_COM
  }

  protected async getDistrictFromName(): Promise<PlaineCommuneDistrictItem[]> {
    const zone: number = +this.districtName.match(/\d+/)[0]

    const filter = {
      'properties.Zone': { $in: [zone, zone.toString()] }
    }

    if (this.city) {
      filter['properties.NOM_COM'] = { $regex: this.city,  $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromPostalCode(): Promise<PlaineCommuneDistrictItem[]> {
    if (!this.postalCode) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.CODE_POST': +this.postalCode
      },
    ).lean()
    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<PlaineCommuneDistrictItem[]> {
    if (!this.city) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.NOM_COM': { $regex: this.city,  $options: 'i' }
      },
    ).lean()

    return districts?.length ? districts : []
  }
}
