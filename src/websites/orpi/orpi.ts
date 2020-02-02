import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { OrpiMapping } from '@interfaces/mapping'
import { Website } from '../website'

export class Orpi extends Website {
    website = 'orpi'

    public async mapping(): Promise<Ad> {
        const ad: OrpiMapping = this.body as OrpiMapping

        return {
            id: ad.id,
            charges: cleanup.price(ad.charges),
            cityLabel: cleanup.string(ad.cityLabel),
            coord: ad.coord,
            description: cleanup.string(ad.description),
            hasCharges: ad.hasCharges,
            furnished: ad.furnished,
            price: ad.price,
            postalCode: ad.postalCode,
            renter: cleanup.string(ad.renter),
            rooms: ad.rooms,
            surface: ad.surface,
            title: cleanup.string(ad.title),
            yearBuilt: !!ad.yearBuilt && ad.yearBuilt,
        }
    }
}
