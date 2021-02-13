import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { MapStrategy } from '@interfaces/mappers'
import { LefigaroMapping } from '@interfaces/mapping'

export class LeFigaroMapper implements MapStrategy {
    async mapping(body: any): Promise<Ad> {
        const ad: LefigaroMapping = body as LefigaroMapping

        return {
            id: ad.id.toString(),
            charges: cleanup.price(ad.charges),
            cityLabel: ad.cityLabel,
            description: cleanup.string(ad.description),
            furnished: ad.furnished,
            hasCharges: ad.hasCharges,
            price: cleanup.price(ad.price),
            renter: cleanup.string(ad.renter),
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
        }
    }
}
