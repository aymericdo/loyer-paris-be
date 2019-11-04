const fs = require('fs')
const opencage = require('opencage-api-client')
const log = require('helper/log.helper')
const inside = require('point-in-polygon')
const stationService = require('service/station.service')
const Fuse = require('fuse.js')
const cleanup = require('helper/cleanup.helper')

const parisAddresses = JSON.parse(fs.readFileSync('json-data/adresse_paris.json', 'utf8'))
const parisDistricts = JSON.parse(fs.readFileSync('json-data/quartier_paris.json', 'utf8'))

function getCoordinate(address, addressInfo) {
    const postalCode = addressInfo && addressInfo.postalCode
    const city = addressInfo && addressInfo.city
    if (city && cleanup.string(city) === 'paris') {
        const result = getAddressInParis(address, { postalCode })
        return Promise.resolve(result && { lat: result[0].fields.geom_x_y[0], lng: result[0].fields.geom_x_y[1] })
    } else {
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
}

function getAddressInParis(q, addressInfo) {
    const options = {
        keys: ['fields.l_adr'],
        shouldSort: true,
        threshold: 0.5,
        tokenize: true,
        matchAllTokens: true,
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

function getDistricts(city, coordinates, address, postalCode, stations) {
    const districtFromCoordinate = coordinates && coordinates.lng && coordinates.lat
        && _getDistrictFromCoordinate(coordinates.lat, coordinates.lng)

    return districtFromCoordinate ?
        Promise.resolve(districtFromCoordinate)
        : address ?
            getCoordinate(address, { city, postalCode })
                .then((coord) => {
                    log.info('info address fetched')
                    const districtFromAddress = coord && _getDistrictFromCoordinate(coord.lat, coord.lng)
                    return districtFromAddress ? {
                        ...districtFromAddress,
                        coord: {
                            lat: coord.lat,
                            lng: coord.lng,
                        },
                    } : _getDistrictFromPostalCode(postalCode, stations)
                })
            : postalCode ?
                Promise.resolve(_getDistrictFromPostalCode(postalCode, stations))
                :
                Promise.resolve({})
}

function _getDistrictFromCoordinate(lat, lng) {
    const district = parisDistricts.find(district => inside([lng, lat], district.fields.geom.coordinates[0]))
    return district ? { districts: [district] } : null
}

function _getDistrictFromPostalCode(postalCode, stations) {
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

module.exports = {
    getCoordinate,
    getAddressInParis,
    getDistricts,
}
