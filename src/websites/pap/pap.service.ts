import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { PapMapping } from '@interfaces/mapping'

export function dataMapping(ad: PapMapping): Ad {
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
