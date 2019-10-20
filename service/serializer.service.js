const log = require('helper/log.helper')

module.exports = ({
    address,
    hasFurniture,
    isLegal,
    maxAuthorized,
    postalCode,
    price,
    roomCount,
    surface,
    yearBuilt,
}, match) => {
    log('sending data', 'green')

    return {
        detectedInfo: {
            address: { order: 0, value: `${address ? address : ''} ${postalCode ? postalCode : ''}` },
            hasFurniture: { order: 1, value: hasFurniture },
            roomCount: { order: 2, value: +roomCount },
            surface: { order: 3, value: +surface },
            yearBuilt: { order: 4, value: +yearBuilt },
            price: { order: 5, value: +(+price).toFixed(2) },
        },
        computedInfo: {
            neighborhood: { order: 0, value: match.fields.nom_quartier },
            hasFurniture: { order: 1, value: !!match.fields.meuble_txt.match(/^meubl/g) },
            roomCount: { order: 2, value: +match.fields.piece },
            surface: { order: 3, value: +surface },
            dateRange: { order: 4, value: match.fields.epoque },
            min: { order: 5, value: match.fields.min },
            max: { order: 6, value: match.fields.max },
            maxAuthorized: { order: 7, value: +maxAuthorized.toFixed(2) },
            promoPercentage: { order: 8, value: !isLegal && +(100 - (maxAuthorized * 100 / +price)).toFixed(2) },
        },
        isLegal,
    }
}
