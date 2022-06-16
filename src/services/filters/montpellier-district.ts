import * as fs from 'fs'
import path from 'path'
import inside from 'point-in-polygon'
import { Coordinate } from '@interfaces/shared'
import { MontpellierDistrictItem } from '@interfaces/json-item-montpellier'
import { Memoize } from 'typescript-memoize'

export class MontpellierDistrictService {
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

  getDistricts(): MontpellierDistrictItem[] {
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

  getDistrictFromPostalCode(): MontpellierDistrictItem[] {
    if (this.postalCode) {
      return this.getDistrictsJson().features.filter((district) => {
        return district.properties.CODE_POST === this.postalCode
      })
    } else {
      return []
    }
  }

  private getDistrictFromName(): MontpellierDistrictItem[] {
    return this.getDistrictsJson().features.filter((district) => {
      return +district.properties.Zone === +this.districtName.match(/\d+/)[0]
    })
  }

  @Memoize()
  private getDistrictsJson(): {
    features: MontpellierDistrictItem[];
    } {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_montpellier_geodata.json'),
        'utf8'
      )
    )
  }

  private getDistrictFromCoordinate(
    lat: number,
    lng: number
  ): MontpellierDistrictItem[] {
    const district = this.getDistrictsJson().features.find((district) =>
      inside([+lng, +lat], district.geometry.coordinates[0])
    )
    return district ? [district] : []
  }
}
