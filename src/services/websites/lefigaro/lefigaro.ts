import { Ad } from '@interfaces/ad'
import { LefigaroMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { Website, WebsiteType } from '@services/websites/website'
import { LefigaroScrapping } from './lefigaro.scrapping'

export class LeFigaro extends Website {
  website: WebsiteType = 'lefigaro'

  async mapping(): Promise<Ad> {
    let ad: LefigaroMapping = null
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

    const scrap = LefigaroScrapping.scrap(JSON.parse(this.body.data))

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
      cityLabel: ad.cityLabel,
      description: cleanup.string(ad.description),
      dpe: ad.dpe ? cleanup.string(ad.dpe) : null,
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
