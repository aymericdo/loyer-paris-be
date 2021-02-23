import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { OrpiMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { OrpiScrapping } from './orpi.scrapping'

export class Orpi extends Website {
    website = 'orpi'

    async mapping(): Promise<Ad> {
        let ad: OrpiMapping = null;
        if (this.isV2) {
            ad = {
                ...OrpiScrapping.scrap(JSON.parse((this.body as any).data)),
                id: (this.body as any).id,
            }
        }

        ad = ad || this.body as OrpiMapping
        return {
            id: ad.id.toString(),
            charges: cleanup.price(ad.charges),
            cityLabel: cleanup.string(ad.cityLabel),
            coord: {
                lat: +ad.coord.lat,
                lng: +ad.coord.lng,
            },
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
