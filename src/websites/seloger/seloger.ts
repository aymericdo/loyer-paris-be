import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { SelogerMapping } from '@interfaces/mapping'
import { Ad } from '@interfaces/ad'
import { Website } from '../website'

export class SeLoger extends Website {
    website = 'seloger'

    async mapping(): Promise<Ad> {
        const ad: SelogerMapping = this.body as SelogerMapping

        return {
            id: ad.id.toString(),
            charges: cleanup.price(ad.charges),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            furnished: ad.furnished,
            hasCharges: ad.hasCharges,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : particulierToken,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
            yearBuilt: !!ad.yearBuilt && cleanup.number(ad.yearBuilt)
        }
    }
}
