import * as cleanup from '@services/helpers/cleanup'
import { Ad } from '@interfaces/ad'
import axios from 'axios'
import { LoueragileMapping, Mapping } from '@interfaces/mapping'
import { Website, WebsiteType } from '@services/websites/website'
import { PrettyLog } from '@services/helpers/pretty-log'
import { ERROR_CODE } from '@services/api/errors'
import { Response } from 'express'

export class LouerAgile extends Website {
  website: WebsiteType = 'loueragile'
  id: string = null

  constructor(res: Response, props: { body: Mapping; id: string }, v2 = false) {
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
      throw { error: ERROR_CODE.Minimal, msg: 'jinka id not found' }
    }

    try {
      const response = await axios.get(
        `https://api.jinka.fr/apiv2/alert/${process.env.LOUER_AGILE_API_KEY}/ad/${this.id}`
      )
      PrettyLog.call('jinka fetched')
      const data = response.data
      this.body = data

      if (!this.body) {
        throw { error: ERROR_CODE.Minimal, msg: 'no more data' }
      }
    } catch (error) {
      throw { error: ERROR_CODE.Partner, msg: 'jinka not responding' }
    }
  }
}
