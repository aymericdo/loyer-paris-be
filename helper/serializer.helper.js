const fs = require('fs')
const yearBuiltService = require('./../service/year-built.service')
const log = require('./../helper/log.helper')
const rangeRents = JSON.parse(fs.readFileSync('encadrements.json', 'utf8'))

module.exports = function ({
    id,
    address,
    postalCode,
    districts,
    hasFurniture,
    price,
    roomCount,
    surface,
    yearBuilt,
}) {
    const yearRange = yearBuiltService.getYearRange(rangeRents, yearBuilt)

    const rentList = rangeRents.filter((rangeRent) => {
        return (districts && districts.filter(Boolean).length ? districts.map(district => district.fields.c_qu).includes(rangeRent.fields.id_quartier) : true)
            && (yearRange ? rangeRent.fields.epoque === yearRange : true)
            && (roomCount ? +roomCount < 5 ? rangeRent.fields.piece === +roomCount : rangeRent.fields.piece === 4 : true)
            && (hasFurniture !== null ? hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
    })

    // Get the worst case scenario
    const rent = rentList.length ?
        rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current)
        :
        null

    log('filter done, sending data')
    return {
        id,
        detectedInfo: {
            address: `${address ? address : ''} ${postalCode ? postalCode : ''}`,
            hasFurniture,
            price: +(+price).toFixed(2),
            roomCount: +roomCount,
            surface: +surface,
            yearBuilt: +yearBuilt,
        },
        computedInfo: rent ? {
            dateRange: rent.fields.epoque,
            hasFurniture: !!rent.fields.meuble_txt.match(/^meubl/g),
            max: rent.fields.max,
            maxAuthorized: +(+rent.fields.max * +surface).toFixed(2),
            min: rent.fields.min,
            neighborhood: rent.fields.nom_quartier,
            roomCount: +rent.fields.piece,
        } : {},
        isLegal: rent ? (+price < +rent.fields.max * +surface) : null,
    }
}
