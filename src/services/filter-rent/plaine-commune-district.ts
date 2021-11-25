import * as fs from 'fs'
import path from 'path'
import inside from 'point-in-polygon'
import { Coordinate } from '@interfaces/shared'
import { PlaineCommuneDistrictItem } from '@interfaces/json-item-plaine-commune'
import { Memoize } from 'typescript-memoize'

export class PlaineCommuneDistrictService {
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

  getDistricts(): PlaineCommuneDistrictItem[] {
    if (this.districtName) {
      return this.getDistrictFromName()
    }

    const districtFromCoordinate =
      this.coordinates?.lat &&
      this.coordinates?.lng &&
      this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

    return districtFromCoordinate?.length
      ? districtFromCoordinate
      : this.getDistrictFromPostalCode()
  }

  getDistrictFromPostalCode(): PlaineCommuneDistrictItem[] {
    if (this.postalCode) {
      return this.getDistrictsJson().features.filter((district) => {
        return district.properties.CODE_POST === this.postalCode
      })
    } else {
      return []
    }
  }

  private getDistrictFromName(): PlaineCommuneDistrictItem[] {
    return this.getDistrictsJson().features.filter((district) => {
      return +district.properties.Zone === +this.districtName.match(/\d+/)[0]
    })
  }

  @Memoize()
  private getDistrictsJson(): {
    features: PlaineCommuneDistrictItem[]
    } {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_plaine-commune_geodata.json'),
        'utf8'
      )
    )
  }

  private getDistrictFromCoordinate(
    lat: number,
    lng: number
  ): PlaineCommuneDistrictItem[] {
    const district = this.getDistrictsJson().features.find((district) =>
      inside([+lng, +lat], district.geometry.coordinates[0])
    )
    return district ? [district] : []
  }
}
