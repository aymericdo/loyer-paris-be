import * as cleanup from '@helpers/cleanup'
import * as log from '@helpers/log'

export const errorEscape = ({
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
    } else if (price > 10000) {
        log.error('not a rent')
        throw { status: 400, msg: 'not a rent', error: 'purchase' }
    }
}

export const noMoreData = () => {
    log.error('NO MORE DATA !')
    throw { status: 403, msg: 'no more data', error: 'minimal' }
}
