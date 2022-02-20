import * as fs from 'fs'
import { ParisDistrictItem } from '@interfaces/json-item-paris'
import path from 'path'
import inside from 'point-in-polygon'
import { Coordinate } from '@interfaces/shared'
import { Memoize } from 'typescript-memoize'

export class ParisDistrictService {
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

  getDistricts(): ParisDistrictItem[] {
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

  getDistrictFromPostalCode(): ParisDistrictItem[] {
    if (this.postalCode) {
      // 75010 -> 10  75009 -> 9
      const code =
        this.postalCode.slice(-2)[0] === '0'
          ? this.postalCode.slice(-1)
          : this.postalCode.slice(-2)

      return this.getDistrictsJson().features.filter((district) => {
        return district.properties.c_ar === +code
      })
    } else {
      return []
    }
  }

  private getDistrictFromName(): ParisDistrictItem[] {
    return this.getDistrictsJson().features.filter((district) => {
      return district.properties.l_qu === this.districtName
    })
  }

  private getDistrictFromCoordinate(
    lat: number,
    lng: number
  ): ParisDistrictItem[] {
    const district = this.getDistrictsJson().features.find((district) =>
      inside([+lng, +lat], district.geometry.coordinates[0])
    )
    return district ? [district] : []
  }

  @Memoize()
  private getDistrictsJson(): { features: ParisDistrictItem[] } {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_paris_geodata.json'),
        'utf8'
      )
    )
  }
}
