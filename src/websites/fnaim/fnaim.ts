import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { FnaimMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { FnaimScrapping } from './fnaim.scrapping'
import { ErrorCode } from '@services/api-errors'
export class Fnaim extends Website {
  website = 'fnaim'

  async mapping(): Promise<Ad> {
    let ad: FnaimMapping = null
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

      const scrap = FnaimScrapping.scrap(JSON.parse(this.body.data))

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

    ad = ad || (this.body as FnaimMapping)
    return {
      id: ad.id.toString(),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      hasCharges: ad.hasCharges,
      charges: cleanup.number(ad.charges),
      yearBuilt: cleanup.number(ad.yearBuilt),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    }
  }
}
