import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { particulierToken } from '@helpers/particulier'
import { FacebookMapping } from '@interfaces/mapping'
import { Website } from '../website'
export class Facebook extends Website {
    website = 'facebook'

    public async mapping(): Promise<Ad> {
        const ad: FacebookMapping = this.body as FacebookMapping
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
        }
    }
}
