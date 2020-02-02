import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
const request = require('request')
import { LoueragileMapping } from '@interfaces/mapping'
import { Website } from '../website'
import * as log from '@helpers/log'

export class LouerAgile extends Website {
    website = 'loueragile'

    public async fetching(): Promise<void> {
        if (!cleanup.number(this.id)) {
            throw { status: 403, msg: 'no address found', error: 'address' }
        }

        await request({
            url: `https://www.loueragile.fr/apiv2/alert/${process.env.LOUER_AGILE_API_KEY}/ad/${this.id}`,
        }, async (error: Error, response: Response, body: string) => {
            if (!body || !!error) {
                log.error('l\'api de loueragile bug')
                throw { status: 403, msg: 'l\'api de loueragile bug', error: 'api' }
            } else {
                log.info('loueragile fetched')
                this.body = JSON.parse(body)
                return await this.body
            }
        })
    }

    public mapping(ad: LoueragileMapping): Ad {
        return {
            id: ad.ad.id,
            cityLabel: ad.ad.city,
            coord: {
                lng: ad.ad.lng,
                lat: ad.ad.lat,
            },
            description: cleanup.string(ad.ad.description),
            furnished: ad.ad.furnished,
            postalCode: ad.ad.postal_code,
            price: ad.ad.rent,
            renter: ad.ad.owner_type === 'Agence' ? cleanup.string(ad.ad.source) : 'Particulier',
            rooms: ad.ad.room,
            surface: ad.ad.area,
            title: cleanup.string(ad.ad.title),
            yearBuilt: ad.yearBuilt,
            stations: ad.ad.stops.map(stop => cleanup.string(stop.name))
        }
    }
}
