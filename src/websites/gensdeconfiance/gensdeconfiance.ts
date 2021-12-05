import * as cleanup from '@helpers/cleanup'
import { GensdeconfianceMapping } from '@interfaces/mapping'
import { Ad } from '@interfaces/ad'
import { Website, WebsiteType } from '../website'
import { particulierToken } from '../../helpers/particulier'
import { GensdeconfianceScrapping } from './gensdeconfiance.scrapping'
import { ERROR_CODE } from '@services/api-errors'

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

    if (this.isV2) {
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
    }

    ad = ad || (this.body as GensdeconfianceMapping)

    return {
      id: ad.id.toString(),
      charges: cleanup.number(ad.charges),
      cityLabel: cleanup.string(ad.cityLabel),
      address: cleanup.string(ad.address),
      description: cleanup.string(ad.description),
      hasCharges: ad.hasCharges,
      price: cleanup.price(ad.price),
      renter: particulierToken,
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    }
  }
}
