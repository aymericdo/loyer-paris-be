import * as fs from 'fs'
import path from 'path'
import inside from 'point-in-polygon'
import { Coordinate } from '@interfaces/shared'
import { EstEnsembleDistrictItem } from '@interfaces/json-item-est-ensemble'
import { Memoize } from 'typescript-memoize'

export class EstEnsembleDistrictService {
  coordinates: Coordinate = null
  postalCode: string = null
  districtName: string = null

  constructor(
    postalCode: string,
    coordinates?: Coordinate,
    districtName?: string
  ) {
    this.coordinates = coordinates
    this.postalCode = postalCode
    this.districtName = districtName
  }

  getDistricts(): EstEnsembleDistrictItem[] {
    if (this.districtName) {
      return this.getDistrictFromName()
    }

    const districtFromCoordinate =
      this.coordinates?.lat &&
      this.coordinates?.lng &&
      this.getDistrictFromCoordinate(
        this.coordinates.lat,
        this.coordinates.lng
      )

    return districtFromCoordinate?.length
      ? districtFromCoordinate
      : this.getDistrictFromPostalCode()
  }

  getDistrictFromPostalCode(): EstEnsembleDistrictItem[] {
    if (this.postalCode) {
      return this.getDistrictsJson().features.filter((district) => {
        return district.properties.CODE_POST === this.postalCode
      })
    } else {
      return []
    }
  }

  private getDistrictFromName(): EstEnsembleDistrictItem[] {
    return this.getDistrictsJson().features.filter((district) => {
      return +district.properties.Zone === +this.districtName.match(/\d+/)[0]
    })
  }

  @Memoize()
  private getDistrictsJson(): {
    features: EstEnsembleDistrictItem[];
    } {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_est-ensemble_geodata.json'),
        'utf8'
      )
    )
  }

  private getDistrictFromCoordinate(
    lat: number,
    lng: number
  ): EstEnsembleDistrictItem[] {
    const district = this.getDistrictsJson().features.find((district) =>
      inside([+lng, +lat], district.geometry.coordinates[0])
    )
    return district ? [district] : []
  }
}
