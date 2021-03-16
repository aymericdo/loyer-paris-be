import * as cleanup from "@helpers/cleanup";
import { Ad } from "@interfaces/ad";
import axios from "axios";
import { LoueragileMapping, Mapping } from "@interfaces/mapping";
import { Website } from "../website";
import * as log from "@helpers/log";
import { ErrorCode } from "@services/api-errors";
import { Response } from "express";

export class LouerAgile extends Website {
  website = 'loueragile'
  id: string = null

  constructor(
    res: Response,
    props: { body: Mapping; id: string },
    v2: boolean = false
  ) {
    super(res, props, v2)
    this.id = props.id
  }

  async mapping(): Promise<Ad> {
    await this.fetching()

    const ad: LoueragileMapping = this.body as LoueragileMapping

    return {
      id: ad.ad.id.toString(),
      cityLabel: ad.ad.city,
      coord: {
        lng: ad.ad.lng,
        lat: ad.ad.lat,
      },
      description: cleanup.string(ad.ad.description),
      furnished: ad.ad.furnished,
      postalCode: ad.ad.postal_code,
      price: ad.ad.rent,
      renter:
        ad.ad.owner_type === 'Agence'
          ? cleanup.string(ad.ad.source)
          : 'Particulier',
      rooms: ad.ad.room,
      surface: ad.ad.area,
      title: cleanup.string(ad.ad.title),
      yearBuilt: ad.yearBuilt,
      stations: ad.ad.stops.map((stop) => cleanup.string(stop.name)),
    }
  }

  private async fetching(): Promise<void> {
    if (!cleanup.number(this.id)) {
      throw { error: ErrorCode.Minimal, msg: 'jinka id not found' }
    }

    try {
      const response = await axios.get(
        `https://api.jinka.fr/apiv2/alert/${process.env.LOUER_AGILE_API_KEY}/ad/${this.id}`
      )
      log.info('jinka fetched')
      const data = response.data
      this.body = data

      if (!this.body) {
        throw { error: ErrorCode.Minimal, msg: 'no more data' }
      }
    } catch (error) {
      throw { error: ErrorCode.Partner, msg: 'jinka not responding' }
    }
  }
}
