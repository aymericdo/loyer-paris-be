import * as cleanup from '../helper/cleanup.helper'
import { particulierToken } from '../helper/particulier.helper'
import type { Ad } from 'src/service/interfaces'

export function dataMapping(ad): Ad {
    return {
        id: ad.id,
        charges: cleanup.price(ad.charges),
        cityLabel: cleanup.string(ad.cityLabel),
        description: cleanup.string(ad.description),
        furnished: ad.furnished != null ? ad.furnished !== 'NC' ? true : false : null,
        hasCharges: ad.hasCharges,
        price: cleanup.price(ad.price),
        renter: ad.renter ? cleanup.string(ad.renter) : particulierToken,
        rooms: cleanup.number(ad.rooms),
        surface: cleanup.number(ad.surface),
        title: cleanup.string(ad.title),
    }
}
