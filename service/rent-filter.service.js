const fs = require('fs')
const yearBuiltService = require('service/year-built.service')
const log = require('helper/log.helper')
const rangeRents = JSON.parse(fs.readFileSync('json-data/encadrements.json', 'utf8'))
const addressService = require('service/address.service')

module.exports = ({
    address,
    city,
    coordinates,
    hasFurniture,
    postalCode,
    roomCount,
    stations,
    yearBuilt,
}) => {
    log.info('rent filter start')

    return addressService.getDistricts(city, coordinates, address, postalCode, stations)
        .then((result) => {
            const yearRange = yearBuiltService.getYearRange(rangeRents, yearBuilt)

            const rentList = rangeRents.filter((rangeRent) => {
                return (result.districts && result.districts.filter(Boolean).length ? result.districts.map(district => district.fields.c_qu).includes(rangeRent.fields.id_quartier) : true)
                    && (yearRange ? rangeRent.fields.epoque === yearRange : true)
                    && (roomCount ? +roomCount < 5 ? rangeRent.fields.piece === +roomCount : rangeRent.fields.piece === 4 : true)
                    && (hasFurniture != null ? hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
            })

            log.info('rent filter done')
            // Get the worst case scenario
            return rentList.length ?
                {
                    match: rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current),
                    coord: result.coord,
                }
                :
                null
        })
}
