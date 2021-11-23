import { Ad } from '@interfaces/ad'
import { AvailableCities, cityList } from './city'
import * as cleanup from '@helpers/cleanup'
import { AddressItem, Coordinate } from '@interfaces/shared'
import { regexString } from '@helpers/regex'
import { LilleAddress } from '@db/db'

export abstract class Digger {
  ad: Ad = null
  city: AvailableCities = null

  constructor(city: AvailableCities, ad: Ad) {
    this.ad = ad
    this.city = city
  }

  public getPostalCode(ad: Ad): string {
    if (cityList[this.city].postalCodePossibilities.length === 1) {
      return cityList[this.city].postalCodePossibilities[0]
    }

    const postalCode =
      (ad.postalCode && this.digForPostalCode(ad.postalCode)) ||
      (ad.cityLabel && this.digForPostalCode(ad.cityLabel)) ||
      (ad.description && this.digForPostalCode(ad.description))

    return postalCode &&
      cityList[this.city].postalCodePossibilities.includes(
        postalCode.toString()
      )
      ? postalCode
      : null
  }

  protected digForPostalCode(text: string): string {
    const postalCodeRe = new RegExp(cityList[this.city].postalCodeRegex[0])
    return text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
  }

  public async getAddress(postalCode: string, ad: Ad): Promise<string> {
    const tab = [ad.address, ad.title, ad.description].filter(Boolean)

    for (const text of tab) {
      const result = await this.digForAddressInText(postalCode, text)
      if (result) {
        return result
      }
    }
  }

  protected async digForAddressInText(
    postalCode: string,
    text: string
  ): Promise<string> {
    const addressRe = new RegExp(regexString('address'))
    const addressesFromRegex = text.match(addressRe) as string[]

    if (addressesFromRegex?.length) {
      const addressesQueries = this.querifyAddresses(addressesFromRegex)
      const result: {
        item: AddressItem
        score: number
        streetNumber: string
      }[] = (
        await Promise.all(
          addressesQueries.map(async (query) => {
            return await this.getBestAddressFromFuzzy(query)
          })
        )
      )
        .flat()
        .filter((r) => (postalCode ? r.item.postalCode === postalCode : true))
        .sort((a, b) => b.score - a.score)

      if (result?.length) {
        // this.setCoordinates(result[0].item.coordinate, result[0].streetNumber)
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

  private querifyAddresses(addressesFromRegex: string[]): string[] {
    return addressesFromRegex
      .map((a) =>
        cleanup.address(a, this.city)
          ? `${cleanup.address(a, this.city)}`
          : null
      )
      .filter(Boolean)
  }

  protected abstract getBestAddressFromFuzzy(query: string): Promise<
    {
      item: AddressItem
      score: number
      streetNumber: string
    }[]
  >

  public method3(): void {
    throw new Error('Abstract Method')
  }
}

export class LilleDigger extends Digger {
  constructor(city: AvailableCities, ad: Ad) {
    super(city, ad)
  }
  public async getBestAddressFromFuzzy(
    query: string
  ): Promise<{ item: AddressItem; score: number; streetNumber: string }[]> {
    if (!query) {
      return null
    }

    const result = (await LilleAddress.find(
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
}

// export class ParisDigger extends Digger {
//   public getPostalCode(city: string, ad: Ad): string {
//     if (cityList[city].postalCodePossibilities.length === 1) {
//       return cityList[city].postalCodePossibilities[0]
//     }

//     const postalCode =
//       (ad.postalCode && this.digForPostalCode(city, ad.postalCode)) ||
//       (ad.cityLabel && this.digForPostalCode(city, ad.cityLabel)) ||
//       this.digForParisPostalCode(city, ad.cityLabel) ||
//       (ad.description && this.digForPostalCode(city, ad.description)) ||
//       this.digForParisPostalCode(city, ad.description)

//     return postalCode &&
//       cityList[city].postalCodePossibilities.includes(postalCode.toString())
//       ? postalCode
//       : null
//   }

//   private digForParisPostalCode(city: string, text: string): string {
//     const postalCode2Re = new RegExp(cityList[city].postalCodeRegex[1])
//     const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
//     return match
//       ? match.trim().length === 1
//         ? `7500${match.trim()}`
//         : `750${match.trim()}`
//       : null
//   }
// }
