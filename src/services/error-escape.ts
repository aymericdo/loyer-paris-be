import * as cleanup from '@helpers/cleanup'
import * as log from '@helpers/log'
import { CleanAd } from '@interfaces/ad';

export class ErrorService {
    constructor() {}

    static errorEscape(cleanAd: CleanAd): void {
        if (!cleanAd.price || !cleanAd.surface) {
            log.error('minimal information not found')
            throw { status: 403, msg: 'minimal information not found', error: 'minimal' }
        } else if (!cleanAd.address && !cleanAd.postalCode) {
            log.error('no address found')
            throw { status: 403, msg: 'no address found', error: 'address' }
        } else if (!(cleanAd.city && cleanup.string(cleanAd.city) === 'paris')) {
            log.error('not in Paris')
            throw { status: 400, msg: 'not in Paris bro', error: 'paris' }
        } else if (cleanAd.price > 10000) {
            log.error('not a rent')
            throw { status: 400, msg: 'not a rent', error: 'purchase' }
        }
    }

    static noMoreData(): void {
        log.error('NO MORE DATA !')
        throw { status: 403, msg: 'no more data', error: 'minimal' }
    }
} 
