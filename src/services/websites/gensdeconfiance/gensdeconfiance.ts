import { Ad } from '@interfaces/ad'
import { GensdeconfianceMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { PARTICULIER_TERM, Website, WebsiteType } from '@services/websites/website'
import { GensdeconfianceScrapping } from './gensdeconfiance.scrapping'

export class Gensdeconfiance extends Website {
  website: WebsiteType = 'gensdeconfiance'

  async mapping(): Promise<Ad> {
    let ad: GensdeconfianceMapping = null
    if (!this.body.id) {
      throw {
        error: ERROR_CODE.Minimal,
        msg: `no more id for ${this.website}/${this.body.platform}`,
      }
    }

    if (this.body.noMoreData) {
      throw {
        error: ERROR_CODE.Minimal,
        msg: `no more data for ${this.website}/${this.body.platform}`,
      }
    }

    const scrap = GensdeconfianceScrapping.scrap(JSON.parse(this.body.data))

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

    return {
      id: ad.id.toString(),
      charges: cleanup.number(ad.charges),
      cityLabel: cleanup.string(ad.cityLabel),
      address: cleanup.string(ad.address),
      description: cleanup.string(ad.description),
      hasCharges: ad.hasCharges,
      price: cleanup.price(ad.price),
      renter: PARTICULIER_TERM,
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    }
  }
}
