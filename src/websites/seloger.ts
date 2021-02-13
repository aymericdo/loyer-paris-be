import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { MapStrategy } from '@interfaces/mappers'
import { SelogerMapping } from '@interfaces/mapping'

export class SelogerMapper implements MapStrategy {
    mapping(body: any): Promise<Ad> {
        const ad: SelogerMapping = body as SelogerMapping

        return {
            id: ad.id.toString(),
            charges: cleanup.price(ad.charges),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            furnished: ad.furnished,
            hasCharges: ad.hasCharges,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : null,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
            yearBuilt: !!ad.yearBuilt && cleanup.number(ad.yearBuilt)
        } as unknown as Promise<Ad>
    }
}
