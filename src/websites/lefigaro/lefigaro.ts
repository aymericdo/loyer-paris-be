import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { LefigaroMapping } from '@interfaces/mapping'
import { ErrorCode } from '@services/api-errors'
import { Website } from '../website'
import { LefigaroScrapping } from './lefigaro.scrapping'

export class LeFigaro extends Website {
  website = 'lefigaro'

  async mapping(): Promise<Ad> {
    let ad: LefigaroMapping = null
    if (!this.body.id) {
      throw {
        error: ErrorCode.Minimal,
        msg: `no more id for ${this.website}/${this.body.platform}`,
      }
    }

    if (this.isV2) {
      if (this.body.noMoreData) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        }
      }

      const scrap = LefigaroScrapping.scrap(JSON.parse(this.body.data))

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

    ad = ad || (this.body as LefigaroMapping)

    return {
      id: ad.id.toString(),
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
}
