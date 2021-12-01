import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { OrpiMapping } from '@interfaces/mapping'
import { ErrorCode } from '@services/api-errors'
import { Website, WebsiteType } from '../website'
import { OrpiScrapping } from './orpi.scrapping'

export class Orpi extends Website {
  website: WebsiteType = 'orpi'

  async mapping(): Promise<Ad> {
    let ad: OrpiMapping = null
    if (!this.body.id) {
      throw {
        error: ErrorCode.Minimal,
        msg: `no more id for ${this.website}/${this.body.platform}`,
      }
    }

    if (this.body.id.match(/photos/g)?.length) {
      throw { error: ErrorCode.Other, msg: 'not a rent' }
    }

    if (this.isV2) {
      if (this.body.noMoreData) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        }
      }

      const scrap = OrpiScrapping.scrap(JSON.parse(this.body.data))

      if (!scrap) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        }
      }

      ad = {
        ...scrap,
        id: this.body.id,
      }
    }

    ad = ad || (this.body as OrpiMapping)
    return {
      id: ad.id.toString(),
      charges: cleanup.number(ad.charges),
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
