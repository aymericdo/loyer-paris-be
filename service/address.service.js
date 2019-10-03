const fs = require('fs')
const opencage = require('opencage-api-client')
const inside = require('point-in-polygon')

const parisDistricts = JSON.parse(fs.readFileSync('quartier_paris.json', 'utf8'))

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

function getDistrictFromCoordinate(lng, lat) {
    return parisDistricts.find(district => inside([lng, lat], district.fields.geom.coordinates[0]))
}

function getDistrictFromPostalCode(postalCode) {
    const code = postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2)
    return parisDistricts.filter(district => district.fields.c_ar === +code)
}

module.exports = {
    getCoordinate,
    getDistrictFromCoordinate,
    getDistrictFromPostalCode,
}
