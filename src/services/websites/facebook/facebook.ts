import { Ad } from '@interfaces/ad'
import { FacebookMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { PARTICULIER_WORD, Website, WebsiteType } from '@services/websites/website'
import { FacebookScrapping } from './facebook.scrapping'
export class Facebook extends Website {
  website: WebsiteType = 'facebook'

  async mapping(): Promise<Ad> {
    let ad: FacebookMapping = null
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

    const scrap = FacebookScrapping.scrap(JSON.parse(this.body.data))

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
      address: cleanup.string(ad.address),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : PARTICULIER_WORD,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    }
  }
}
