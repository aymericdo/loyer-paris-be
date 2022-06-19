import * as fs from 'fs'
import path from 'path'
import inside from 'point-in-polygon'
import { Coordinate } from '@interfaces/shared'
import { LilleDistrictItem } from '@interfaces/json-item-lille'
import { Memoize } from 'typescript-memoize'

export class LilleDistrictService {
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

  getDistricts(): LilleDistrictItem[] {
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

    return districtFromCoordinate?.length ? districtFromCoordinate : []
  }

  private getDistrictFromName(): LilleDistrictItem[] {
    return this.getDistrictsJson().features.filter((district) => {
      return district.properties.zonage === +this.districtName.match(/\d+/)[0]
    })
  }

  @Memoize()
  private getDistrictsJson(): { features: LilleDistrictItem[] } {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_lille_geodata.json'),
        'utf8'
      )
    )
  }

  private getDistrictFromCoordinate(
    lat: number,
    lng: number
  ): LilleDistrictItem[] {
    const district = this.getDistrictsJson().features.find((district) =>
      inside([+lng, +lat], district.geometry.coordinates[0])
    )
    return district ? [district] : []
  }
}