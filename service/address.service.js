const fs = require('fs')
const opencage = require('opencage-api-client')
const log = require('helper/log.helper')
const inside = require('point-in-polygon')
const stationService = require('service/station.service')

const parisDistricts = JSON.parse(fs.readFileSync('json-data/quartier_paris.json', 'utf8'))

function getCoordinate(address) {
    return opencage.geocode({ q: address, countrycode: 'fr' }).then(data => {
        if (data.status.code == 200) {
            if (data.results.length > 0) {
                const place = data.results[0]
                return place
            }
        } else if (data.status.code == 402) {
            console.log('hit free-trial daily limit')
            console.log('become a customer: https://opencagedata.com/pricing')
        } else {
            // other possible response codes:
            // https://opencagedata.com/api#codes
            console.log('error', data.status.message)
        }
    }).catch(error => {
        console.log('error', error.message)
    })
}

function getDistricts(city, coordinates, address, postalCode, stations) {
    const districtFromCoordinate = coordinates && coordinates.lng && coordinates.lat
        && _getDistrictFromCoordinate(coordinates.lat, coordinates.lng)

    return districtFromCoordinate ?
        Promise.resolve(districtFromCoordinate)
        : address ?
            getCoordinate(`${address} ${postalCode ? postalCode : ''} ${city ? city : ''}`)
                .then((info) => {
                    log('info address fetched')
                    const districtFromAddress = info && _getDistrictFromCoordinate(info.geometry.lat, info.geometry.lng)
                    return districtFromAddress ? {
                        ...districtFromAddress,
                        coord: {
                            lng: info.geometry.lng,
                            lat: info.geometry.lat,
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

        return { districts: parisDistricts.filter(district => {
            return district.fields.c_ar === +code && (stationDistricts.length ? stationDistricts.includes(district.fields.l_qu) : true)
        })}
    } else {
        return {}
    }
}

module.exports = {
    getCoordinate,
    getDistricts,
    _getDistrictFromPostalCode,
}
