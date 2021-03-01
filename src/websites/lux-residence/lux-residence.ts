import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { particulierToken } from '@helpers/particulier'
import { FacebookMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { LuxResidenceScrapping } from './lux-residence.scrapping'
import { ErrorCode } from '@services/api-errors'
export class LuxResidence extends Website {
    website = 'luxresidence'

    async mapping(): Promise<Ad> {
        let ad: FacebookMapping = null;
        if (this.isV2) {
            ad = {
                ...LuxResidenceScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }

            if (!ad) {
              throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
            }
        }

        ad = ad || this.body as FacebookMapping
        return {
            id: ad.id.toString(),
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
