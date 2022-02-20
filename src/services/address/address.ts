import { regexString } from '@helpers/regex';
import { Ad } from '@interfaces/ad';
import { AddressItem, Coordinate } from '@interfaces/shared';
import { cityList } from './city';
import * as cleanup from '@helpers/cleanup';
import {
  LilleAddress,
  LyonAddress,
  ParisAddress,
  PlaineCommuneAddress,
} from '@db/db';

const dbMapping = {
  paris: ParisAddress,
  lyon: LyonAddress,
  lille: LilleAddress,
  plaineCommune: PlaineCommuneAddress,
}

export interface AddressStrategy {
  getAddress(): Promise<[string, Coordinate, Coordinate]>;
}

export class AddressStrategyFactory {
  getDiggerStrategy(city: string, postalCode: string, ad: Ad): AddressStrategy {
    const parisStrategy = new ParisAddressStrategy(city, postalCode, ad)
    const defaultStrategy = new DefaultAddressStrategy(city, postalCode, ad)
    switch (city) {
      case 'paris': {
        return parisStrategy
      }
      default: {
        return defaultStrategy
      }
    }
  }
}

export class DefaultAddressStrategy implements AddressStrategy {
  private city: string
  private postalCode: string
  private ad: Ad
  coordinates: Coordinate
  blurryCoordinates: Coordinate

  constructor(city: string, postalCode: string, ad: Ad) {
    this.city = city
    this.postalCode = postalCode
    this.ad = ad
  }

  public async getAddress(): Promise<[string, Coordinate, Coordinate]> {
    const tab = [this.ad.address, this.ad.title, this.ad.description].filter(
      Boolean
    )

    for (const text of tab) {
      const result = await this.digForAddressInText(
        this.city,
        this.postalCode,
        text
      )
      if (result) {
        const coord = this.getCoordinate()
        const blurryCoord = this.getCoordinate(true)
        return [result, coord, blurryCoord]
      }
    }
    return [null, null, null]
  }

  protected async digForAddressInText(
    city: string,
    postalCode: string,
    text: string
  ): Promise<string> {
    const addressRe = new RegExp(regexString('address'))
    const addressesFromRegex = text.match(addressRe) as string[]
    if (addressesFromRegex?.length) {
      const addressesQueries = this.querifyAddresses(city, addressesFromRegex)
      const result: {
        item: AddressItem;
        score: number;
        streetNumber: string;
      }[] = (
        await Promise.all(
          addressesQueries.map(async (query) => {
            return await this.getAddressCompleted(city, query)
          })
        )
      )
        .flat()
        .filter((r) => (postalCode ? r.item.postalCode === postalCode : true))
        .sort((a, b) => b.score - a.score)

      if (result?.length) {
        this.setCoordinates(result[0].item.coordinate, result[0].streetNumber)
        return result[0].streetNumber
          ? cleanup
            .string(result[0].item.address)
            .replace(/^\d+(b|t)?/g, result[0].streetNumber.toString())
          : cleanup
            .string(result[0].item.address)
            .replace(/^\d+(b|t)?/g, '')
            .trim()
      } else {
        return null
      }
    } else {
      return null
    }
  }

  protected querifyAddresses(
    city: string,
    addressesFromRegex: string[]
  ): string[] {
    return addressesFromRegex
      .map((a) =>
        cleanup.address(a, city) ? `${cleanup.address(a, city)}` : null
      )
      .filter(Boolean)
  }

  protected async getAddressCompleted(
    city: string,
    query: string
  ): Promise<
    {
      item: AddressItem;
      score: number;
      streetNumber: string;
    }[]
  > {
    if (!query) {
      return null
    }
    const addressDb = dbMapping[cityList[city].mainCity]
    const result = (await addressDb
      .find(
        {
          $text: { $search: query },
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean()) as any
    return result
      ? result.map((r) => ({
        item: {
          address: `${r.numero} ${r.nom_voie}`,
          postalCode: r.code_postal.toString(),
          coordinate: {
            lng: +r.geometry.coordinates[0],
            lat: +r.geometry.coordinates[1],
          },
        },
        score: r.score,
        streetNumber: cleanup.streetNumber(query),
      }))
      : []
  }

  protected setCoordinates(coord: Coordinate, streetNumber: string): void {
    if (streetNumber) {
      this.coordinates = { ...coord }
    } else {
      this.blurryCoordinates = { ...coord }
    }
  }

  private getCoordinate(blurry = false): Coordinate {
    const coordinatesFromAd =
      this.ad.coord?.lng && this.ad.coord?.lat
        ? {
          lng: this.ad.coord.lng,
          lat: this.ad.coord.lat,
        }
        : null

    if (
      coordinatesFromAd?.lng.toString().length > 9 &&
      coordinatesFromAd?.lat.toString().length > 9
    ) {
      return coordinatesFromAd
    } else {
      if (blurry) {
        return this.blurryCoordinates || coordinatesFromAd
      } else {
        return this.coordinates || coordinatesFromAd
      }
    }
  }
}

export class ParisAddressStrategy extends DefaultAddressStrategy {
  protected async getAddressCompleted(
    city: string,
    query: string
  ): Promise<
    {
      item: AddressItem;
      score: number;
      streetNumber: string;
    }[]
  > {
    if (!query) {
      return null
    }
    const addressDb = dbMapping[cityList[city].mainCity]
    const result = (await addressDb
      .find(
        {
          $text: { $search: query },
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean()) as any
    return result
      ? result.map((r) => ({
        item: {
          address: r.fields.l_adr,
          postalCode: this.postalCodeFormat(r.fields.c_ar.toString()),
          coordinate: {
            lng: r.fields.geom.coordinates[0],
            lat: r.fields.geom.coordinates[1],
          },
        },
        score: r.score,
        streetNumber: cleanup.streetNumber(query),
      }))
      : []
  }

  private postalCodeFormat(postalCode: string): string {
    // 10 -> 75010 9 -> 75009
    return postalCode.length === 1 ? `7500${postalCode}` : `750${postalCode}`
  }
}
