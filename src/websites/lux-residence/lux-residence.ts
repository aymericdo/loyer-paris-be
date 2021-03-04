import * as cleanup from "@helpers/cleanup";
import { Ad } from "@interfaces/ad";
import { LuxResidenceMapping } from "@interfaces/mapping";
import { Website } from "../website";
import { LuxResidenceScrapping } from "./lux-residence.scrapping";
import { ErrorCode } from "@services/api-errors";
export class LuxResidence extends Website {
  website = "luxresidence";

  async mapping(): Promise<Ad> {
    let ad: LuxResidenceMapping = null;
    if (this.isV2) {
      if (!this.body.id) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more id for ${this.website}/${this.body.platform}`,
        };
      }

      const scrap = LuxResidenceScrapping.scrap(JSON.parse(this.body.data));

      if (!scrap) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more data for ${this.website}/${this.body.platform}`,
        };
      }

      ad = {
        ...scrap,
        id: this.body.id,
      };
    }

    ad = ad || (this.body as LuxResidenceMapping);
    return {
      id: ad.id.toString(),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
    };
  }
}
