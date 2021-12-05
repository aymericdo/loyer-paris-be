import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { BienIciMapping } from '@interfaces/mapping'
import { Website, WebsiteType } from '../website'
import { BienIciScrapping } from './bienici.scrapping'
import { ERROR_CODE } from '@services/api-errors'
export class BienIci extends Website {
  website: WebsiteType = 'bienici'

  async mapping(): Promise<Ad> {
    let ad: BienIciMapping = null
    if (!this.body.id) {
      throw {
        error: ERROR_CODE.Minimal,
        msg: `no more id for ${this.website}/${this.body.platform}`,
      }
    }

    if (this.isV2) {
      if (this.body.noMoreData) {
        throw {
          error: ERROR_CODE.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        }
      }

      const scrap = BienIciScrapping.scrap(JSON.parse(this.body.data))

      if (!scrap) {
        throw {
          error: ERROR_CODE.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        }
      }

      ad = {
        ...scrap,
        id: this.body.id,
      }
    }

    ad = ad || (this.body as BienIciMapping)
    return {
      id: ad.id.toString(),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      hasCharges: ad.hasCharges,
      charges: cleanup.number(ad.charges),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    }
  }
}
