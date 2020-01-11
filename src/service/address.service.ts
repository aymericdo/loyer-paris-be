import * as fs from 'fs'
import * as path from 'path'
const opencage = require('opencage-api-client')
const inside = require('point-in-polygon')
const Fuse = require('fuse.js')
import * as stationService from '../service/station.service'

let parisAddresses = null
fs.readFile(path.join(__dirname, '../json-data/adresse_paris.json'), 'utf8', (error, data) => {
    parisAddresses = JSON.parse(data)
})

let parisDistricts = null
fs.readFile(path.join(__dirname, '../json-data/quartier_paris.json'), 'utf8', (error, data) => {
    parisDistricts = JSON.parse(data)
})

export function getCoordinate(address, addressInfo) {
    const postalCode = addressInfo && addressInfo.postalCode
    const addressInParis = getAddressInParis(address, { postalCode })
    const result = addressInParis && addressInParis.map(address => address.item)
    return result && { lat: result[0].fields.geom_x_y[0], lng: result[0].fields.geom_x_y[1] }
}

export function getCoordinateWithOpenCage(address, addressInfo) {
    const postalCode = addressInfo && addressInfo.postalCode
    const city = addressInfo && addressInfo.city
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

export function getAddressInParis(q, addressInfo) {
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
    return result && result.length ? result : null
}

export function getDistricts(coordinates, postalCode, stations) {
    const districtFromCoordinate = coordinates && coordinates.lng && coordinates.lat
        && _getDistrictFromCoordinate(coordinates.lat, coordinates.lng)

    return districtFromCoordinate ?
        districtFromCoordinate
        : postalCode ?
            _getDistrictFromPostalCode(postalCode, stations)
            :
            {}
}

export function _getDistrictFromCoordinate(lat, lng) {
    const district = parisDistricts.find(district => inside([lng, lat], district.fields.geom.coordinates[0]))
    return district ? { districts: [district] } : null
}

export function _getDistrictFromPostalCode(postalCode, stations) {
    if (postalCode) {
        // 75010 -> 10 ; 75009 -> 9
        const code = postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2)

        let stationDistricts = []
        if (stations) {
            stationDistricts = stations.map(station => {
                const coord = stationService.getCoordinate(station)
                const district = coord && parisDistricts.find(district => inside([coord.lng, coord.lat], district.fields.geom.coordinates[0]))
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
