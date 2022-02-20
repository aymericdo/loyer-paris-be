import * as cleanup from '@helpers/cleanup';
import { Website, WebsiteType, PARTICULIER_TERM } from '@websites/website';
import { Ad } from '@interfaces/ad';
import { LocserviceMapping } from '@interfaces/mapping';
import { ERROR_CODE } from '@services/api-errors';
import { LocserviceScrapping } from './locservice.scrapping';

export class Locservice extends Website {
  website: WebsiteType = 'locservice';

  async mapping(): Promise<Ad> {
    let ad: LocserviceMapping = null
    if (!this.body.id) {
      throw {
        error: ERROR_CODE.Minimal,
        msg: `no more id for ${this.website}/${this.body.platform}`,
      }
    }

    const scrap = LocserviceScrapping.scrap(JSON.parse(this.body.data))

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
      hasCharges: ad.hasCharges,
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      renter: PARTICULIER_TERM,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    }
  }
}
