import * as fs from 'fs'
import { DistrictItem } from "@interfaces/json-item"
import path from "path"
import inside from "point-in-polygon"
import { Coordinate } from '@interfaces/shared'

export class DistrictService {
    city: string
    coordinates: Coordinate = null
    postalCode: string = null
    stations: string[] = null
    districts: DistrictItem[]

    constructor(
        city: string,
        coordinates: Coordinate,
        postalCode: string,
    ) {
        this.city = city
        this.coordinates = coordinates
        this.postalCode = postalCode
        if (this.city === "paris") {
            this.districts = JSON.parse(fs.readFileSync(path.join('json-data/quartier_paris.json'), 'utf8'))
        }
        else if (this.city === "lille") {
            this.districts = JSON.parse(fs.readFileSync(path.join('json-data/encadrement-des-loyers-a-lille-lomme-et-hellemmes-zonage.json'), 'utf8'))
        }
        else {
            console.error("city not correct for district")
        }
    }

    getDistricts(): DistrictItem[] {
        const districtFromCoordinate = this.coordinates && this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

        return districtFromCoordinate ?
            districtFromCoordinate
            :
            this.city === "paris" && this.getDistrictFromPostalCode()
    }

    private getDistrictFromPostalCode(postalCode: string, stations: string[]): DistrictItem[] {
        const stationService = new StationService(this.city)
        if (postalCode) {
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