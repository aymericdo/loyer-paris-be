import * as cleanup from '@helpers/cleanup'
import { SelogerMapping } from '@interfaces/mapping'
import { Ad } from '@interfaces/ad'
import { Website } from '../website'
import { SelogerScrapping } from './seloger.scrapping';
import { ErrorCode } from '@services/api-errors';

export class SeLoger extends Website {
    website = 'seloger'

    async mapping(): Promise<Ad> {
        let ad: SelogerMapping = null;
        if (this.isV2) {
            ad = {
                ...SelogerScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }

            if (!ad) {
                throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
            }
        }

        ad = ad || this.body as SelogerMapping
        return {
            id: ad.id.toString(),
            charges: cleanup.price(ad.charges),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            furnished: ad.furnished,
            hasCharges: ad.hasCharges,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : null,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
            yearBuilt: !!ad.yearBuilt && cleanup.number(ad.yearBuilt)
        }
    }
}
