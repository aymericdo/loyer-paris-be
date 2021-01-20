import { particulierToken } from '@helpers/particulier'
import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { LeboncoinMapping } from '@interfaces/mapping'
import { Website } from '../website'

export class LeBonCoin extends Website {
    website = 'leboncoin'

    async mapping(): Promise<Ad> {
        const ad: LeboncoinMapping = this.body as LeboncoinMapping
        return {
            id: ad.id.toString(),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.body),
            furnished: ad.furnished ? ad.furnished === 'Meublé' ? true : ad.furnished === 'Non meublé' ? false : null : null,
            hasCharges: cleanup.string(ad.hasCharges) === 'oui' ? true : cleanup.string(ad.hasCharges) === 'non' ? false : null,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : particulierToken,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.subject),
        }
    }
}
