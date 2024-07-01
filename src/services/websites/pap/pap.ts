import { Ad } from '@interfaces/ad'
import { PapMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { PARTICULIER_WORD, Website, WebsiteType } from '@services/websites/website'
import { PapScrapping } from './pap.scrapping'

export class Pap extends Website {
  website: WebsiteType = 'pap'

  async mapping(): Promise<Ad> {
    let ad: PapMapping = null
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

    const scrap = PapScrapping.scrap(JSON.parse(this.body.data))

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

    if (!ad.id) {
      throw { error: ERROR_CODE.Other, msg: 'not a rent' }
    }

    return {
      id: ad.id.toString(),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      dpe: ad.dpe ? cleanup.string(ad.dpe) : null,
      price: cleanup.price(ad.price),
      charges: cleanup.price(ad.charges),
      rooms: cleanup.number(ad.rooms),
      renter: PARTICULIER_WORD,
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
      stations: ad.stations && ad.stations.map((station) => cleanup.string(station)),
    }
  }
}
