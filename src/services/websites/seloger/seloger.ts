import { Ad } from '@interfaces/ad'
import { SelogerMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { Website, WebsiteType } from '@services/websites/website'
import { SelogerScraping } from './seloger.scraping'

export class SeLoger extends Website {
  website: WebsiteType = 'seloger'

  async mapping(): Promise<Ad> {
    let ad: SelogerMapping = null
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

    const scrap = SelogerScraping.scrap(JSON.parse(this.body.data))

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
      description: cleanup.string(ad.description),
      dpe: ad.dpe ? cleanup.string(ad.dpe) : null,
      furnished: ad.furnished,
      hasCharges: ad.hasCharges,
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
      yearBuilt: !!ad.yearBuilt && cleanup.number(ad.yearBuilt),
    }
  }
}
