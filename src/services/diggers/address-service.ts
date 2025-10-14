import { Ad } from '@interfaces/ad'
import { Coordinate, AddressItem } from '@interfaces/shared'
import { AvailableCities } from '@services/city-config/classic-cities'
import { regexString } from '@services/helpers/regex'
import * as cleanup from '@services/helpers/cleanup'
import { AddressResponse, DataGouvAddressItem } from '@interfaces/address'
import axios, { AxiosError } from 'axios'
import { PrettyLog } from '@services/helpers/pretty-log'
import { inseeCode } from '@services/city-config/city-selectors'
import { ERROR_CODE } from '@services/api/errors'

export class AddressService {
  private city: AvailableCities
  private postalCode: string
  private ad: Ad
  coordinates: Coordinate
  blurryCoordinates: Coordinate

  constructor(city: AvailableCities, postalCode: string, ad: Ad) {
    this.city = city
    this.postalCode = postalCode
    this.ad = ad
  }

  static async getAddresses(
    city: AvailableCities,
    query: string,
  ): Promise<DataGouvAddressItem[]> {
    if (query.trim().length < 4) return []

    const limit = 5
    const url = `https://data.geopf.fr/geocodage/completion/?text=${query}+${city}&type=StreetAddress&maximumResponses=${limit}`
    // const url = `https://api-adresse.data.gouv.fr/search/?q=${query}+${city}&limit=${limit}&citycode=${inseeCode(city)}&autocomplete=1`
    const retries = 5
    const baseDelay = 1000
    const factor = 2

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios(url)
        return this.convertGeoPfDataToDataGouvAddressItem(
          response.data,
          inseeCode(city),
        )

        // const dataGouv: DataGouvAddress = response.data
        // return dataGouv.features
      } catch (err) {
        const error = err as AxiosError
        const status = error?.response?.status
        const isTimeoutOr504 = status === 504 || error.code === 'ECONNABORTED'

        PrettyLog.call(`Tentative ${attempt} échouée`, 'yellow')
        PrettyLog.call(JSON.stringify(error), 'red')

        if (isTimeoutOr504 || attempt >= retries) {
          throw {
            error: ERROR_CODE.ApiAdresseError,
            msg: error.message,
            status: error.status,
          }
        }

        // ⏳ Délai doublé à chaque tentative : 1s, 2s, 4s, 8s...
        const wait = baseDelay * Math.pow(factor, attempt - 1)
        PrettyLog.call(`Nouvelle tentative dans ${wait / 1000}s`, 'blue')
        await new Promise((resolve) => setTimeout(resolve, wait))
      }
    }

    return []
  }

  async getAddress(): Promise<[string, Coordinate, Coordinate]> {
    const tab = [this.ad.address, this.ad.title, this.ad.description].filter(
      Boolean,
    )

    for (const text of tab) {
      const result = await this.digForAddressInText(
        this.city,
        this.postalCode,
        text,
      )
      if (result) {
        const coord = this.getCoordinate()
        const blurryCoord = this.getCoordinate(true)
        return [result, coord, blurryCoord]
      }
    }
    return [null, null, null]
  }

  private async digForAddressInText(
    city: AvailableCities,
    postalCode: string,
    text: string,
  ): Promise<string> {
    const addressRe = new RegExp(regexString('address'))
    const addressesFromRegex = text.match(addressRe) as string[]
    if (addressesFromRegex?.length) {
      const addressesQueries = this.querifyAddresses(city, addressesFromRegex)

      const result: {
        item: AddressItem
        score: number
        streetNumber: string
      }[] = (
        await Promise.all(
          addressesQueries.map(async (query) => {
            return await this.getAddressCompleted(city, query)
          }),
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

  private querifyAddresses(
    city: AvailableCities,
    addressesFromRegex: string[],
  ): string[] {
    return addressesFromRegex
      .map((a) => cleanup.address(a, city) ?? null)
      .filter(Boolean)
  }

  protected async getAddressCompleted(
    city: AvailableCities,
    query: string,
  ): Promise<
    {
      item: AddressItem
      score: number
      streetNumber: string
    }[]
  > {
    if (!query) {
      return null
    }

    const result: DataGouvAddressItem[] = await AddressService.getAddresses(
      city,
      query,
    )

    return result
      ? result.map((r: DataGouvAddressItem) => ({
          item: {
            address: r.properties.name,
            postalCode: r.properties.postcode,
            coordinate: {
              lng: +r.geometry?.coordinates[0],
              lat: +r.geometry?.coordinates[1],
            },
          },
          score: r.properties.score,
          streetNumber: cleanup.streetNumber(query)?.toString(),
        }))
      : []
  }

  private setCoordinates(coord: Coordinate, streetNumber: string): void {
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

  private static convertGeoPfDataToDataGouvAddressItem(
    result: AddressResponse,
    citycode: string,
  ): DataGouvAddressItem[] {
    if (!result.results?.length) return []

    return result.results.map((r) => {
      // Extraction du numéro de rue s’il est présent dans le libellé
      const houseNumberMatch = r.fulltext.match(/^\d+/)
      const housenumber = houseNumberMatch ? houseNumberMatch[0] : ''

      // Construction de l'identifiant (fictif mais cohérent)
      const id = `${citycode}_${r.street?.replace(/\s+/g, '_')}_${housenumber || '00000'}`

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [r.x, r.y],
        },
        properties: {
          label: r.fulltext,
          score: 1,
          housenumber,
          id,
          name: `${housenumber ? housenumber + ' ' : ''}${r.street}`,
          postcode: r.zipcode,
          citycode,
          x: r.x,
          y: r.y,
          city: r.city,
          importance: 1,
          street: r.street,
        },
      }
    })
  }
}
