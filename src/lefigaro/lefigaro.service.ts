import * as cleanup from '../helper/cleanup.helper'
import { Ad } from 'src/service/interfaces'
import { LefigaroMapping } from '../service/interfaces';

export function dataMapping(ad: LefigaroMapping): Ad {
    return {
        id: ad.id,
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
