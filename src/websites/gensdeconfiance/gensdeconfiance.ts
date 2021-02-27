import * as cleanup from '@helpers/cleanup'
import { GensdeconfianceMapping } from '@interfaces/mapping'
import { Ad } from '@interfaces/ad'
import { Website } from '../website'
import { particulierToken } from '../../helpers/particulier';
import { GensdeconfianceScrapping } from './gensdeconfiance.scrapping';
import { ErrorCode } from '@services/api-errors';

export class Gensdeconfiance extends Website {
    website = 'gensdeconfiance'

    async mapping(): Promise<Ad> {
        let ad: GensdeconfianceMapping = null;
        if (this.isV2) {
            ad = {
                ...GensdeconfianceScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }

            if (!ad) {
                throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
            }
        }

        ad = ad || this.body as GensdeconfianceMapping

        return {
            id: ad.id.toString(),
            charges: cleanup.price(ad.charges),
            cityLabel: cleanup.string(ad.cityLabel),
            address: cleanup.string(ad.address),
            description: cleanup.string(ad.description),
            hasCharges: ad.hasCharges,
            price: cleanup.price(ad.price),
            renter: particulierToken,
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
        }
    }
}
