import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { MapStrategy } from '@interfaces/mappers'
import { PapMapping } from '@interfaces/mapping'

export class PapMapper implements MapStrategy {
    async mapping(body: any): Promise<Ad> {
        const ad: PapMapping = body as PapMapping

        return {
            id: ad.id.toString(),
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
}
