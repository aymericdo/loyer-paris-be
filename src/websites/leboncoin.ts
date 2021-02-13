import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { MapStrategy } from '@interfaces/mappers'
import { LeboncoinMapping } from '@interfaces/mapping'

export class LeBonCoinMapper implements MapStrategy {
    async mapping(body: any): Promise<Ad> {
        const ad: LeboncoinMapping = body as LeboncoinMapping
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
