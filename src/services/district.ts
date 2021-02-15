import * as fs from 'fs'
import { DistrictItem } from "@interfaces/json-item"
import path from "path"
import inside from "point-in-polygon"
import { Coordinate } from '@interfaces/shared'
import { StationService } from '@services/station'

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
        stations: string[],
    ) {
        this.city = city
        this.coordinates = coordinates
        this.postalCode = postalCode
        this.stations = stations
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
            this.city === "paris" && this.getDistrictFromPostalCode(this.postalCode, this.stations)
    }

    private getDistrictFromCoordinate(lat: number, lng: number): DistrictItem[] {
        const district = this.districts.find(district => inside([+lng, +lat], district.fields.geom.coordinates[0]))
        return district ? [district] : []
    }

    private getDistrictFromPostalCode(postalCode: string, stations: string[]): DistrictItem[] {
        const stationService = new StationService(this.city)
        if (postalCode) {
            // 75010 -> 10  75009 -> 9
            const code = postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2)

            let stationDistricts = []
            if (stations && stations.length > 0) {
                stationDistricts = stations.map(station => {
                    const coord = stationService.getCoordinate(station)
                    const district = coord && this.districts.find(district => inside([+coord.lng, +coord.lat], district.fields.geom.coordinates[0]))
                    return district && district.fields.l_qu
                }).filter(Boolean)
            }

            return this.districts.filter(district => {
                return district.fields.c_ar === +code && (stationDistricts.length ? stationDistricts.includes(district.fields.l_qu) : true)
            })
        } else {
            return []
        }
    }
}