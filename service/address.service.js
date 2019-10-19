const fs = require('fs')
const opencage = require('opencage-api-client')
const log = require('./../helper/log.helper')
const inside = require('point-in-polygon')

const parisDistricts = JSON.parse(fs.readFileSync('json-data/quartier_paris.json', 'utf8'))

function getCoordinate(address) {
    return opencage.geocode({ q: address }).then(data => {
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

function getDistricts(coordinates, address, postalCode) {
    return coordinates && coordinates.lng && coordinates.lat ?
        Promise.resolve({ districts: [_getDistrictFromCoordinate(coordinates.lng, coordinates.lat)] })
        : address ?
            getCoordinate(`${address} ${postalCode ? postalCode : ''}`)
                .then((info) => {
                    log('info address fetched')
                    return info && {
                        districts: [_getDistrictFromCoordinate(info.geometry.lng, info.geometry.lat)],
                        coord: {
                            lng: info.geometry.lng,
                            lat: info.geometry.lat,
                        },
                    }
                })
            : postalCode ?
                Promise.resolve({ districts: _getDistrictFromPostalCode(postalCode) })
                :
                Promise.resolve({})
}

function _getDistrictFromCoordinate(lng, lat) {
    return parisDistricts.find(district => inside([lng, lat], district.fields.geom.coordinates[0]))
}

function _getDistrictFromPostalCode(postalCode) {
    const code = postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2)
    return parisDistricts.filter(district => district.fields.c_ar === +code)
}

module.exports = {
    getCoordinate,
    getDistricts,
}
