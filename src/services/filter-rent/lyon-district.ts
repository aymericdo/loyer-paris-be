import * as fs from 'fs'
import path from 'path'
import inside from 'point-in-polygon'
import { Coordinate } from '@interfaces/shared'
import { LyonAddressItem } from '@interfaces/json-item-lyon'
import { Memoize } from 'typescript-memoize'

export class LyonDistrictService {
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

  getDistricts(): LyonAddressItem[] {
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

  getDistrictFromPostalCode(): LyonAddressItem[] {
    if (this.postalCode) {
      return this.getDistrictsJson().features.filter((district) => {
        return (
          this.getPostalCode(district.properties.commune) === this.postalCode
        )
      })
    } else {
      return []
    }
  }

  private getDistrictFromName(): LyonAddressItem[] {
    return this.getDistrictsJson().features.filter((district) => {
      return +district.properties.zonage === +this.districtName.match(/\d+/)[0]
    })
  }

  @Memoize()
  private getDistrictsJson(): {
    features: LyonAddressItem[]
    } {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/encadrements_lyon.json'), 'utf8')
    )
  }

  private getPostalCode(cityName: string): string {
    switch (cityName) {
      case 'Villeurbanne':
        return '69100'
      case 'Lyon 1er Arrondissement':
        return '69001'
      case 'Lyon 2e Arrondissement':
        return '69002'
      case 'Lyon 3e Arrondissement':
        return '69003'
      case 'Lyon 4e Arrondissement':
        return '69004'
      case 'Lyon 5e Arrondissement':
        return '69005'
      case 'Lyon 6e Arrondissement':
        return '69006'
      case 'Lyon 7e Arrondissement':
        return '69007'
      case 'Lyon 8e Arrondissement':
        return '69008'
      case 'Lyon 9e Arrondissement':
        return '69009'
    }
  }

  private getDistrictFromCoordinate(
    lat: number,
    lng: number
  ): LyonAddressItem[] {
    const district = this.getDistrictsJson().features.find((district) =>
      inside([+lng, +lat], district.geometry.coordinates[0])
    )
    return district ? [district] : []
  }
}
