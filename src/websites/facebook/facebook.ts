import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { particulierToken } from '@helpers/particulier'
import { FacebookMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { FacebookScrapping } from './facebook.scrapping'
import { ErrorCode } from '@services/api-errors'
export class Facebook extends Website {
    website = 'facebook'

    async mapping(): Promise<Ad> {
        let ad: FacebookMapping = null;
        if (this.isV2) {
            ad = {
                ...FacebookScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }

            if (!ad) {
                throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
            }
        }

        ad = ad || this.body as FacebookMapping
        console.log(ad)
        return {
            id: ad.id.toString(),
            address: cleanup.string(ad.address),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            furnished: ad.furnished,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : particulierToken,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
        }
    }
}
