import * as fs from 'fs'
import { DistrictItem } from "@interfaces/json-item"
import path from "path"
import inside from "point-in-polygon"
import { Coordinate } from '@interfaces/shared'
import { StationService } from '@services/station'

const parisDistricts: DistrictItem[] = JSON.parse(fs.readFileSync(path.join('json-data/quartier_paris.json'), 'utf8'))

export class DistrictService {
    coordinates: Coordinate = null
    postalCode: string = null
    stations: string[] = null

    constructor (
      coordinates: Coordinate,
      postalCode: string,
      stations: string[],
    ) {
        this.coordinates = coordinates
        this.postalCode = postalCode
        this.stations = stations
    }

    getDistricts(): DistrictItem[] {
      const districtFromCoordinate = this.coordinates && this.getDistrictFromCoordinate(this.coordinates.lat, this.coordinates.lng)

      return districtFromCoordinate ?
            districtFromCoordinate
        :
            this.getDistrictFromPostalCode(this.postalCode, this.stations)
    }

    private getDistrictFromCoordinate(lat: number, lng: number): DistrictItem[] {
        const district = parisDistricts.find(district => inside([+lng, +lat], district.fields.geom.coordinates[0]))
        return district ? [district] : []
    }

    private getDistrictFromPostalCode(postalCode: string, stations: string[]): DistrictItem[] {
        if (postalCode) {
            // 75010 -> 10  75009 -> 9
            const code = postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2)
            
            let stationDistricts = []
            if (stations) {
                stationDistricts = stations.map(station => {
                    const coord = StationService.getCoordinate(station)
                    const district = coord && parisDistricts.find(district => inside([+coord.lng, +coord.lat], district.fields.geom.coordinates[0]))
                    return district && district.fields.l_qu
                }).filter(Boolean)
            }
            
            return parisDistricts.filter(district => {
                return district.fields.c_ar === +code && (stationDistricts.length ? stationDistricts.includes(district.fields.l_qu) : true)
            })
        } else {
            return []
        }
    }
}