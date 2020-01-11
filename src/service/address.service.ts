import * as fs from 'fs'
import * as path from 'path'
import opencage from 'opencage-api-client'
import inside from 'point-in-polygon'
import Fuse from 'fuse.js'
import * as stationService from '../service/station.service'
import type { GeoJSON } from 'geojson'
import { AddressInfo, Coordinate } from './interfaces'

let parisAddresses: any = null
fs.readFile(path.join(__dirname, '../json-data/adresse_paris.json'), 'utf8', (error, data) => {
    parisAddresses = JSON.parse(data)
})

let parisDistricts: any = null
fs.readFile(path.join(__dirname, '../json-data/quartier_paris.json'), 'utf8', (error, data) => {
    parisDistricts = JSON.parse(data)
})

export function getCoordinate(address: string, addressInfo: AddressInfo): Coordinate {
    const postalCode = addressInfo?.postalCode
    const addressInParis = getAddressInParis(address, { postalCode }) as any // TO BE PRECISED
    const result = addressInParis?.map(address => address.item)
    return result && { lat: result[0].fields.geom_x_y[0], lng: result[0].fields.geom_x_y[1] }
}

export function getCoordinateWithOpenCage(address: string, addressInfo: AddressInfo): Coordinate {
    const postalCode = addressInfo?.postalCode
    const city = addressInfo?.city
    return opencage.geocode({ q: `${address} ${postalCode ? postalCode : ''} ${city ? city : ''}`, countrycode: 'fr' })
        .then(data => {
            if (data.status.code == 200) {
                if (data.results.length > 0) {
                    const place = data.results[0]
                    return {
                        lat: place.geometry.lat,
                        lng: place.geometry.lng,
                    }
                }
            } else if (data.status.code == 402) {
                console.log('hit free-trial daily limit')
                console.log('become a customer: https://opencagedata.com/pricing')
            } else {
                // other possible response codes:
                // https://opencagedata.com/api#codes
                console.log('error', data.status.message)
            }
        })
        .catch(error => {
            console.log('error', error.message)
        })
}

export function getAddressInParis(q: string, addressInfo: AddressInfo) {
    const options = {
        keys: ['fields.l_adr'],
        shouldSort: true,
        includeScore: true,
        threshold: 0.6,
        tokenize: true,
        matchAllTokens: true,
    }

    if (!q) {
        return null
    }

    const fuse = new Fuse(parisAddresses.filter(address => {
        if (!(addressInfo && addressInfo.postalCode)) {
            return true
        }

        // 75010 -> 10; 75009 -> 9
        const code = (addressInfo.postalCode.slice(-2)[0] === '0' ? addressInfo.postalCode.slice(-1) : addressInfo.postalCode.slice(-2))
        return code ? address.fields.c_ar === +code : true
    }), options)

    const result = fuse.search(q)
    return result?.length ? result : null
}

export function getDistricts(coordinates: Coordinate, postalCode: string, stations: string[]) {
    const districtFromCoordinate = _getDistrictFromCoordinate(coordinates?.lat, coordinates?.lng)

    return districtFromCoordinate ?
        districtFromCoordinate
        : postalCode ?
            _getDistrictFromPostalCode(postalCode, stations)
            :
            {}
}

export function _getDistrictFromCoordinate(lat: string, lng: string) {
    const district = parisDistricts.find(district => inside([+lng, +lat], district.fields.geom.coordinates[0]))
    return district ? { districts: [district] } : null
}

export function _getDistrictFromPostalCode(postalCode: string, stations: string[]) {
    if (postalCode) {
        // 75010 -> 10 ; 75009 -> 9
        const code = postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2)

        let stationDistricts = []
        if (stations) {
            stationDistricts = stations.map(station => {
                const coord = stationService.getCoordinate(station)
                const district = coord && parisDistricts.find(district => inside([+coord.lng, +coord.lat], district.fields.geom.coordinates[0]))
                return district && district.fields.l_qu
            }).filter(Boolean)
        }

        return {
            districts: parisDistricts.filter(district => {
                return district.fields.c_ar === +code && (stationDistricts.length ? stationDistricts.includes(district.fields.l_qu) : true)
            })
        }
    } else {
        return {}
    }
}
