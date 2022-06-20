import inside from 'point-in-polygon'
import { Coordinate, DefaultDistrictItem, DistrictItem } from '@interfaces/shared'
import { DistrictsList } from '@services/districts/districts-list'
import { AvailableMainCities } from '@services/address/city'

export class DistrictFilterParent {
  city: AvailableMainCities = null
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

  getFirstDistrict(): DistrictItem {
    return this.getDistricts()[0] as DistrictItem
  }

  getDistricts(): DistrictItem[] {
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

  protected getDistrictsJson(): DistrictItem[] {
    return new DistrictsList(this.city as AvailableMainCities).currentGeodata().features
  }

  protected getDistrictFromName(): DistrictItem[] {
    return (this.getDistrictsJson() as DefaultDistrictItem[]).filter((district) => {
      return +district.properties.Zone === +this.districtName.match(/\d+/)[0]
    })
  }

  protected getDistrictFromPostalCode(): DistrictItem[] {
    if (this.postalCode) {
      return (this.getDistrictsJson() as DefaultDistrictItem[]).filter((district) => {
        return district.properties.CODE_POST === this.postalCode
      })
    } else {
      return []
    }
  }

  private getDistrictFromCoordinate(
    lat: number,
    lng: number
  ): DistrictItem[] {
    const district = (this.getDistrictsJson() as DefaultDistrictItem[]).find((district) =>
      inside([+lng, +lat], district.geometry.coordinates[0])
    )
    return district ? [district] : []
  }
}
