import { Ad } from '@interfaces/ad'
import { LuxResidenceMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { Website, WebsiteType } from '@services/websites/website'
import { LuxResidenceScraping } from './lux-residence.scraping'
export class LuxResidence extends Website {
  website: WebsiteType = 'luxresidence'

  async mapping(): Promise<Ad> {
    let ad: LuxResidenceMapping = null
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

    const scrap = LuxResidenceScraping.scrap(JSON.parse(this.body.data))

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
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      charges: cleanup.price(ad.charges),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
      dpe: ad.dpe ? cleanup.string(ad.dpe) : null,
    }
  }
}
