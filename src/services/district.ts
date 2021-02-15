import * as fs from 'fs'
import { DistrictItem } from "@interfaces/json-item"
import path from "path"
import inside from "point-in-polygon"
import { Coordinate } from '@interfaces/shared'

const parisDistricts: { features: DistrictItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/quartier_paris_geodata.json'), 'utf8'))

export class DistrictService {
    coordinates: Coordinate = null
    postalCode: string = null

    constructor (
        postalCode: string,
        coordinates?: Coordinate,
    ) {
        this.coordinates = coordinates
        this.postalCode = postalCode
    }

    getDistricts(): DistrictItem[] {
      const districtFromCoordinate = this.coordinates && this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

      return districtFromCoordinate ?
            districtFromCoordinate
        :
            this.getDistrictFromPostalCode()
    }

    getDistrictFromPostalCode(): DistrictItem[] {
        if (this.postalCode) {
            // 75010 -> 10  75009 -> 9
            const code = this.postalCode.slice(-2)[0] === '0' ? this.postalCode.slice(-1) : this.postalCode.slice(-2)

            return parisDistricts.features.filter(district => {
                return district.properties.c_ar === +code;
            })
        } else {
            return []
        }
    }

    private getDistrictFromCoordinate(lat: number, lng: number): DistrictItem[] {
        const district = parisDistricts.features.find(district => inside([+lng, +lat], district.geometry.coordinates[0]))
        return district ? [district] : []
    }
}