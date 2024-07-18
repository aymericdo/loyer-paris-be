import { Ad } from '@interfaces/ad'
import { AvendrealouerMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { Website, WebsiteType } from '@services/websites/website'
import { AvendrealouerScrapping } from './avendrealouer.scrapping'
export class Avendrealouer extends Website {
  website: WebsiteType = 'avendrealouer'

  async mapping(): Promise<Ad> {
    let ad: AvendrealouerMapping = null
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

    const scrap = AvendrealouerScrapping.scrap(JSON.parse(this.body.data))

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
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      hasCharges: ad.hasCharges,
      charges: cleanup.number(ad.charges),
      surface: cleanup.number(ad.surface),
      furnished: ad.furnished,
      title: cleanup.string(ad.title),
      yearBuilt: cleanup.number(ad.yearBuilt),
    }
  }
}
