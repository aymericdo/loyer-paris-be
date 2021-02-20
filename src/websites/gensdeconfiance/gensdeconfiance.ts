import * as cleanup from '@helpers/cleanup'
import { GensdeconfianceMapping } from '@interfaces/mapping'
import { Ad } from '@interfaces/ad'
import { Website } from '../website'
import { particulierToken } from '../../helpers/particulier';

export class Gensdeconfiance extends Website {
    website = 'gensdeconfiance'

    async mapping(): Promise<Ad> {
        const ad: GensdeconfianceMapping = this.body as GensdeconfianceMapping

        if (this.isV2) {
            console.log(this.body)
        } else {
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
}
