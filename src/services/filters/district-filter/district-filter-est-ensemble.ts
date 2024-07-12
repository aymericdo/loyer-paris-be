import { DefaultDistrictItem } from '@interfaces/shared'
import { AvailableMainCities } from '@services/filters/city-filter/city-list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { EstEnsembleGeojson } from '@db/db'
import { EstEnsembleDistrictItem } from '@interfaces/est-ensemble'

export class DistrictFilterEstEnsemble extends DistrictFilterParent {
  GeojsonCollection = EstEnsembleGeojson
  mainCity: AvailableMainCities = 'estEnsemble'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  digCityInProperties(data: unknown): string {
    return data['com_name']
  }

  protected async getDistrictFromName(): Promise<EstEnsembleDistrictItem[]> {
    const zone: number = +this.districtName.match(/\d+/)[0]

    const filter = {
      'properties.Zone': { $in: [zone, zone.toString()] }
    }

    if (this.city) {
      filter['properties.com_name'] = { $regex: this.city,  $options: 'i' }
    }

    const districts = await this.GeojsonCollection.find(filter).lean()

    return districts?.length ? districts : []
  }

  protected async getDistrictsFromPostalCode(): Promise<EstEnsembleDistrictItem[]> {
    if (!this.postalCode) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.com_code': +this.postalCode
      },
    ).lean()
    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<EstEnsembleDistrictItem[]> {
    if (!this.city) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.com_name': { $regex: this.city,  $options: 'i' }
      },
    ).lean()
    return districts?.length ? districts : []
  }
}
