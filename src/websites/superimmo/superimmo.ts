import * as cleanup from '@helpers/cleanup'
import { Ad } from '@interfaces/ad'
import { SuperimmoMapping } from '@interfaces/mapping'
import { Website } from '../website'
import { SuperimmoScrapping } from './superimmo.scrapping'
import { ErrorCode } from '@services/api-errors'
export class Superimmo extends Website {
  website = 'superimmo'

  async mapping(): Promise<Ad> {
    let ad: SuperimmoMapping = null
    if (!this.body.id) {
      throw {
        error: ErrorCode.Minimal,
        msg: `no more id for ${this.website}/${this.body.platform}`,
      }
    }

    if (this.isV2) {
      if (this.body.noMoreData) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        }
      }

      const scrap = SuperimmoScrapping.scrap(JSON.parse(this.body.data))

      if (!scrap) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        }
      }

      ad = {
        ...scrap,
        id: this.body.id,
      }
    }

    ad = ad || (this.body as SuperimmoMapping)
    return {
      id: ad.id.toString(),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      hasCharges: ad.hasCharges,
      surface: cleanup.number(ad.surface),
      yearBuilt: cleanup.number(ad.yearBuilt),
      title: cleanup.string(ad.title),
    }
  }
}
