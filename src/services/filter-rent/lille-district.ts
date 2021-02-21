
import * as fs from 'fs'
import path from "path"
import inside from "point-in-polygon"
import { Coordinate } from '@interfaces/shared'
import { LilleDistrictItem } from '@interfaces/json-item-lille'

const lilleDistricts: { features: LilleDistrictItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/quartier_lille_geodata.json'), 'utf8'))

export class LilleDistrictService {
    coordinates: Coordinate = null
    postalCode: string = null

    constructor (
        postalCode: string,
        coordinates?: Coordinate,
    ) {
        this.coordinates = coordinates
        this.postalCode = postalCode
    }

    getDistricts(): LilleDistrictItem[] {
      const districtFromCoordinate = this.coordinates && this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

      return districtFromCoordinate ?
            districtFromCoordinate
        :
            null
    }

    private getDistrictFromCoordinate(lat: number, lng: number): LilleDistrictItem[] {
        const district = lilleDistricts.features.find(district => inside([+lng, +lat], district.geometry.coordinates[0]))
        return district ? [district] : []
    }
}