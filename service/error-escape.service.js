const log = require('helper/log.helper')
const cleanup = require('helper/cleanup.helper')

module.exports = ({
    address,
    city,
    postalCode,
    price,
    surface,
}) => {
    if (!price || !surface) {
        log.error('minimal information not found')
        throw { status: 403, msg: 'minimal information not found', error: 'minimal' }
    } else if (!address && !postalCode) {
        log.error('no address found')
        throw { status: 403, msg: 'no address found', error: 'address' }
    } else if (!(city && cleanup.string(city) === 'paris')) {
        log.error('not in Paris')
        throw { status: 400, msg: 'not in Paris bro', error: 'paris' }
    }
}
