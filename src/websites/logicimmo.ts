import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { MapStrategy } from '@interfaces/mappers'
import { LogicimmoMapping } from '@interfaces/mapping'

export class LogicImmoMapper implements MapStrategy {
    async mapping(body: any): Promise<Ad> {
        const ad: LogicimmoMapping = body as LogicimmoMapping

        return {
            id: ad.id.toString(),
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
}
