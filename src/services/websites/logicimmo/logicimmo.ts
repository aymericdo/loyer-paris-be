import { Ad } from '@interfaces/ad'
import { LogicimmoMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { PARTICULIER_TERM, Website, WebsiteType } from '@services/websites/website'
import { LogicimmoScrapping } from './logicimmo.scrapping'

export class LogicImmo extends Website {
  website: WebsiteType = 'logicimmo'

  async mapping(): Promise<Ad> {
    let ad: LogicimmoMapping = null
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

    const scrap = LogicimmoScrapping.scrap(JSON.parse(this.body.data))

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
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : PARTICULIER_TERM,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
    }
  }
}
