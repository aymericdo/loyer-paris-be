import { Ad } from '@interfaces/ad'
import { OrpiMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { Website, WebsiteType } from '@services/websites/website'
import { OrpiScrapping } from './orpi.scrapping'

export class Orpi extends Website {
  website: WebsiteType = 'orpi'

  async mapping(): Promise<Ad> {
    let ad: OrpiMapping = null
    if (!this.body.id) {
      throw {
        error: ERROR_CODE.Minimal,
        msg: `no more id for ${this.website}/${this.body.platform}`,
      }
    }

    if (this.body.id.match(/photos/g)?.length) {
      throw { error: ERROR_CODE.Other, msg: 'not a rent' }
    }

    if (this.body.noMoreData) {
      throw {
        error: ERROR_CODE.Minimal,
        msg: `no more data for ${this.website}/${this.body.platform}`,
      }
    }

    const scrap = OrpiScrapping.scrap(JSON.parse(this.body.data))

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
      hasCharges: ad.hasCharges,
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      renter: cleanup.string(ad.renter),
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    }
  }
}
