import { Ad } from '@interfaces/ad'
import { LeboncoinMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import * as cleanup from '@services/helpers/cleanup'
import { PARTICULIER, Website, WebsiteType } from '@services/websites/website'
import { LeboncoinScrapping } from './leboncoin.scrapping'

export class LeBonCoin extends Website {
  website: WebsiteType = 'leboncoin'

  async mapping(): Promise<Ad> {
    let ad: LeboncoinMapping = null
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

    const scrap = LeboncoinScrapping.scrap(JSON.parse(this.body.data))

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
      description: cleanup.string(ad.body),
      dpe: ad.dpe ? cleanup.string(ad.dpe) : null,
      furnished: ad.furnished
        ? ad.furnished === 'Meublé'
          ? true
          : ad.furnished === 'Non meublé'
            ? false
            : null
        : null,
      hasCharges: ad.hasCharges,
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : PARTICULIER,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.subject),
      isHouse: ad.isHouse,
    }
  }
}
