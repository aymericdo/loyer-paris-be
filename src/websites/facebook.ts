import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { MapStrategy } from '@interfaces/mappers'
import { FacebookMapping } from '@interfaces/mapping'
export class FacebookMapper implements MapStrategy {
    mapping(body: any): Promise<Ad> {
        const ad: FacebookMapping = body as FacebookMapping
        return {
            id: ad.id.toString(),
            address: cleanup.string(ad.address),
            cityLabel: cleanup.string(ad.cityLabel),
            description: cleanup.string(ad.description),
            furnished: ad.furnished,
            price: cleanup.price(ad.price),
            renter: ad.renter ? cleanup.string(ad.renter) : particulierToken,
            rooms: cleanup.number(ad.rooms),
            surface: cleanup.number(ad.surface),
            title: cleanup.string(ad.title),
        } as unknown as Promise<Ad>;
    }
}
