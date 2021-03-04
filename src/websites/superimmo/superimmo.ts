import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { SuperimmoMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { SuperimmoScrapping } from './superimmo.scrapping'
import { ErrorCode } from '@services/api-errors'
export class Superimmo extends Website {
    website = 'superimmo'

    async mapping(): Promise<Ad> {
        let ad: SuperimmoMapping = null;
        if (this.isV2) {
            ad = {
                ...SuperimmoScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }

            if (!ad) {
              throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
            }
        }

        ad = ad || this.body as SuperimmoMapping
        console.log(ad)
        return {
            id: ad.id.toString(),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : null,
            rooms: cleanup.number(ad.rooms),
            hasCharges: ad.hasCharges,
            surface: cleanup.number(ad.surface),
            yearBuilt: cleanup.number(ad.yearBuilt),
            title: cleanup.string(ad.title),
        }
    }
}
