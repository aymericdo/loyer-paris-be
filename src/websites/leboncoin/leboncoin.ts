import { particulierToken } from '@helpers/particulier'
import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { LeboncoinMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { LeboncoinScrapping } from './leboncoin.scrapping'
import { ErrorCode } from '@services/api-errors'

export class LeBonCoin extends Website {
    website = 'leboncoin'

    async mapping(): Promise<Ad> {
        let ad: LeboncoinMapping = null;
        if (this.isV2) {
            ad = {
                ...LeboncoinScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }

            if (!ad) {
                throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
            }
        }

        ad = ad || this.body as LeboncoinMapping
        return {
            id: ad.id.toString(),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.body),
            furnished: ad.furnished ? ad.furnished === 'Meublé' ? true : ad.furnished === 'Non meublé' ? false : null : null,
            hasCharges: ad.hasCharges,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : particulierToken,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.subject),
        }
    }
}
