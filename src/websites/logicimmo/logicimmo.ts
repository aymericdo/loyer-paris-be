import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { LogicimmoMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { LogicimmoScrapping } from './logicimmo.scrapping'

export class LogicImmo extends Website {
    website = 'logicimmo'

    async mapping(): Promise<Ad> {
        let ad: LogicimmoMapping = null;
        if (this.isV2) {
            ad = {
                ...LogicimmoScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }
        }

        ad = ad || this.body as LogicimmoMapping
        return {
            id: ad.id.toString(),
            charges: cleanup.price(ad.charges),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            furnished: ad.furnished != null ? ad.furnished !== 'NC' ? true : false : null,
            hasCharges: ad.hasCharges,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : particulierToken,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
        }
    }
}
