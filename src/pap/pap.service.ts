import * as cleanup from '../helper/cleanup.helper'
import { particulierToken } from '../helper/particulier.helper'
import type { Ad } from 'src/service/interfaces'

export function dataMapping(ad): Ad {
    return {
        id: ad.id,
        cityLabel: cleanup.string(ad.cityLabel),
        description: cleanup.string(ad.description),
        price: cleanup.price(ad.price),
        rooms: cleanup.number(ad.rooms),
        renter: particulierToken,
        surface: cleanup.number(ad.surface),
        title: cleanup.string(ad.title),
        stations: ad.stations.map(station => cleanup.string(station)),
    }
}
