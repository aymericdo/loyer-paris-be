import { DefaultDistrictItem, DistrictItemProperties } from '@interfaces/shared'
import { AvailableMainCities } from '@services/city-config/list'
import { DistrictFilterParent } from './encadrement-district-filter-parent'
import { EstEnsembleGeojson } from '@db/db'
import { EstEnsembleDistrictItem, EstEnsembleDistrictItemProperties } from '@interfaces/est-ensemble'

export class DistrictFilterEstEnsemble extends DistrictFilterParent {
  GeojsonCollection = EstEnsembleGeojson
  mainCity: AvailableMainCities = 'estEnsemble'

  async getDistricts(): Promise<DefaultDistrictItem[]> {
    return super.getDistricts() as Promise<DefaultDistrictItem[]>
  }

  digZoneInProperties(data: DistrictItemProperties): string {
    return `Zone ${(data as EstEnsembleDistrictItemProperties).Zone}`
  }

  digCityInProperties(data: EstEnsembleDistrictItemProperties): string {
    return data.NOM_COM
  }

  protected async getDistrictFromName(): Promise<EstEnsembleDistrictItem[]> {
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

  protected async getDistrictsFromPostalCode(): Promise<EstEnsembleDistrictItem[]> {
    if (!this.postalCode) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.CODE_POST': this.postalCode.toString(),
      },
    ).lean()
    return districts?.length ? districts : []
  }

  protected async getDistrictsFromCity(): Promise<EstEnsembleDistrictItem[]> {
    if (!this.city) return []

    const districts = await this.GeojsonCollection.find(
      {
        'properties.NOM_COM': { $regex: this.city,  $options: 'i' }
      },
    ).lean()

    return districts?.length ? districts : []
  }
}
