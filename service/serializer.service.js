const log = require('../helper/log.helper')

module.exports = ({
    id,
    address,
    postalCode,
    hasFurniture,
    price,
    roomCount,
    surface,
    yearBuilt,
}, match) => {
    log('sending data', 'green')
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
        computedInfo: {
            dateRange: match.fields.epoque,
            hasFurniture: !!match.fields.meuble_txt.match(/^meubl/g),
            max: match.fields.max,
            maxAuthorized: +(+match.fields.max * +surface).toFixed(2),
            min: match.fields.min,
            neighborhood: match.fields.nom_quartier,
            roomCount: +match.fields.piece,
        },
        isLegal: +price < +match.fields.max * +surface,
    }
}
