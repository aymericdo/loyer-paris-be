import * as cleanup from '../helper/cleanup.helper'
import { Ad } from 'src/service/interfaces'
import { OrpiMapping } from '../service/interfaces';

export function dataMapping(ad: OrpiMapping): Ad {
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
