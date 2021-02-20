import * as fs from 'fs'
import { LilleDistrictItem, ParisDistrictItem } from "@interfaces/json-item"
import path from "path"
import inside from "point-in-polygon"
import { Coordinate } from '@interfaces/shared'

const parisDistricts: { features: ParisDistrictItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/quartier_paris_geodata.json'), 'utf8'))
const lilleDistricts: { features: LilleDistrictItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/quartier_lille_geodata.json'), 'utf8'))

const districts = {
    paris: parisDistricts,
    lille: lilleDistricts,
};

export class DistrictService {
    city: string = null
    coordinates: Coordinate = null
    postalCode: string = null

    constructor(
        city: string,
        postalCode: string,
        coordinates?: Coordinate,
    ) {
        this.city = city
        this.coordinates = coordinates
        this.postalCode = postalCode
    }

    getDistricts(): ParisDistrictItem[] {
        const districtFromCoordinate = this.coordinates && this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

        return districtFromCoordinate ?
            districtFromCoordinate
            :
            this.getDistrictFromPostalCode()
    }

    getDistrictFromPostalCode(): ParisDistrictItem[] {
        if (this.postalCode) {
            // 75010 -> 10  75009 -> 9
            const code = this.postalCode.slice(-2)[0] === '0' ? this.postalCode.slice(-1) : this.postalCode.slice(-2)

            return districts[this.city].features.filter(district => {
                return district.properties.c_ar === +code;
            })
        } else {
            return []
        }
    }

    private getDistrictFromCoordinate(lat: number, lng: number): ParisDistrictItem[] {
        const district = districts[this.city].features.find(district => inside([+lng, +lat], district.geometry.coordinates[0]))
        return district ? [district] : []
    }
}