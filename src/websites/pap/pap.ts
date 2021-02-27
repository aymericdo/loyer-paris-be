import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { PapMapping } from '@interfaces/mapping'
import { ErrorCode } from '@services/api-errors'
import { Website } from '../website'
import { PapScrapping } from './pap.scrapping'

export class Pap extends Website {
    website = 'pap'

    async mapping(): Promise<Ad> {
        let ad: PapMapping = null;
        if (this.isV2) {
            ad = {
                ...PapScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }

            if (!ad) {
                throw { error: ErrorCode.Minimal, msg: `no more data for ${this.website}/${this.body.platform}` }
            }
        }

        ad = ad || this.body as PapMapping
        return {
            id: ad.id.toString(),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            price: cleanup.price(ad.price),
            rooms: cleanup.number(ad.rooms),
            renter: particulierToken,
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
            stations: ad.stations.map(station => cleanup.string(station)),
        }
    }
}
