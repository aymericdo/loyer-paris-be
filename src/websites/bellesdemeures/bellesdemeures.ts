import * as cleanup from "@helpers/cleanup";
import { Ad } from "@interfaces/ad";
import { BellesDemeuresMapping } from "@interfaces/mapping";
import { Website } from "../website";
import { BellesDemeuresScrapping } from "./bellesdemeures.scrapping";
import { ErrorCode } from "@services/api-errors";
export class BellesDemeures extends Website {
  website = "bellesdemeures";

  async mapping(): Promise<Ad> {
    let ad: BellesDemeuresMapping = null;
    if (this.isV2) {
      if (!this.body.id) {
        throw {
          error: ErrorCode.Minimal,
          msg: `no more id for ${this.website}/${this.body.platform}`,
        };
      }

      const scrap = BellesDemeuresScrapping.scrap(JSON.parse(this.body.data));

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

    ad = ad || (this.body as BellesDemeuresMapping);
    return {
      id: ad.id.toString(),
      cityLabel: cleanup.string(ad.cityLabel),
      description: cleanup.string(ad.description),
      furnished: ad.furnished,
      price: cleanup.price(ad.price),
      renter: ad.renter ? cleanup.string(ad.renter) : null,
      rooms: cleanup.number(ad.rooms),
      surface: cleanup.number(ad.surface),
      title: cleanup.string(ad.title),
    };
  }
}
