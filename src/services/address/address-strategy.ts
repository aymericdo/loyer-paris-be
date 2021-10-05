import { LilleAddress, ParisAddress, PlaineCommuneAddress } from '@db/db'
import * as cleanup from '@helpers/cleanup'
import { AddressSearchResult } from '@interfaces/shared'
import { AvailableCities, formatParisPostalCode } from './city'

export interface AddressSearchStrategy {
  getAddressCompleted(query: string): Promise<AddressSearchResult>
}

export class AddressSearcher implements AddressSearchStrategy {
  city: AvailableCities
  constructor(city: AvailableCities) {
    this.city = city
  }

  getAddressCompleted(query: string): Promise<AddressSearchResult> {
    const addressDiggerStrategyFactory = new AddressSearcherStrategyFactory()
    return addressDiggerStrategyFactory
      .getSearcherStrategy(this.city.toString())
      .getAddressCompleted(query)
  }
}

export class AddressSearcherStrategyFactory {
  getSearcherStrategy(city: string): AddressSearchStrategy {
    const parisSearcher = new ParisAddressSearchStrategy()
    const lilleSearcher = new LilleAddressSearchStrategy()
    const plaineCommuneSearcher = new PlaineCommuneAddressSearchStrategy()
    const noSearcher = new NoAddressSearcher(city as string)
    switch (city) {
      case 'paris': {
        return parisSearcher
      }
      case 'lille':
      case 'hellemmes':
      case 'lomme': {
        return lilleSearcher
      }
      case 'aubervilliers':
      case 'epinay-sur-seine':
      case 'ile-saint-denis':
      case 'courneuve':
      case 'pierrefitte':
      case 'saint-denis':
      case 'saint-ouen':
      case 'stains':
      case 'villetaneuse': {
        return plaineCommuneSearcher
      }
      default: {
        return noSearcher
      }
    }
  }
}

export class ParisAddressSearchStrategy implements AddressSearchStrategy {
  public async getAddressCompleted(
    query: string
  ): Promise<AddressSearchResult> {
    const result = await ParisAddress.find(
      {
        $text: { $search: query.toString() },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean()

    return result
      ? result.map((r) => ({
          item: {
            address: r.fields.l_adr,
            postalCode: formatParisPostalCode(r.fields.c_ar.toString()),
            coordinate: {
              lng: r.fields.geom.coordinates[0],
              lat: r.fields.geom.coordinates[1],
            },
          },
          score: r.score,
          streetNumber: cleanup.string(query)?.match(/^\d+(b|t)?/g) || null,
        }))
      : []
  }
}

export class LilleAddressSearchStrategy implements AddressSearchStrategy {
  public async getAddressCompleted(
    query: string
  ): Promise<AddressSearchResult> {
    const result = await LilleAddress.find(
      {
        $text: { $search: query },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean()

    return result
      ? result.map((r) => ({
          item: {
            address: r.numero + r.nom_voie,
            postalCode: r.code_postal.toString(),
            coordinate: {
              lng: +r.geometry.coordinates[0],
              lat: +r.geometry.coordinates[1],
            },
          },
          score: r.score,
          streetNumber: cleanup.string(query)?.match(/^\d+(b|t)?/g) || null,
        }))
      : []
  }
}

export class PlaineCommuneAddressSearchStrategy
  implements AddressSearchStrategy
{
  public async getAddressCompleted(
    query: string
  ): Promise<AddressSearchResult> {
    const result = await PlaineCommuneAddress.find(
      {
        $text: { $search: query },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean()

    return result
      ? result.map((r) => ({
          item: {
            address: r.numero + r.nom_voie,
            postalCode: r.code_postal.toString(),
            coordinate: {
              lng: +r.geometry.coordinates[0],
              lat: +r.geometry.coordinates[1],
            },
          },
          score: r.score,
          streetNumber: cleanup.string(query)?.match(/^\d+(b|t)?/g) || null,
        }))
      : []
  }
}

export class NoAddressSearcher implements AddressSearchStrategy {
  city: string
  constructor(city: string) {
    this.city = city
  }
  getAddressCompleted(_: string): Promise<AddressSearchResult> {
    return
  }
}
