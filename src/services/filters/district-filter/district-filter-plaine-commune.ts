import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/filters/city-filter/valid-cities-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { PlaineCommuneDistrictItem } from '@interfaces/plaine-commune'
import { PlaineCommuneGeojson } from '@db/db'

export class PlaineCommuneDistrictFilter extends DistrictFilterParent {
  GeojsonCollection = PlaineCommuneGeojson
  mainCity: AvailableMainCities = 'plaineCommune'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
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
