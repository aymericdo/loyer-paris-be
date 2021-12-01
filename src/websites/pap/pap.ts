import * as cleanup from '@helpers/cleanup'
import { particulierToken } from '@helpers/particulier'
import { Ad } from '@interfaces/ad'
import { PapMapping } from '@interfaces/mapping'
import { ErrorCode } from '@services/api-errors'
import { Website, WebsiteType } from '../website'
import { PapScrapping } from './pap.scrapping'

export class Pap extends Website {
  website: WebsiteType = 'pap'

  async mapping(): Promise<Ad> {
    let ad: PapMapping = null
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

      const scrap = PapScrapping.scrap(JSON.parse(this.body.data))

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

    ad = ad || (this.body as PapMapping)

    if (!ad.id) {
      throw { error: ErrorCode.Other, msg: 'not a rent' }
    }

    return {
      id: ad.id.toString(),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      price: cleanup.price(ad.price),
      rooms: cleanup.number(ad.rooms),
      renter: particulierToken,
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
      stations:
        ad.stations && ad.stations.map((station) => cleanup.string(station)),
    }
  }
}
