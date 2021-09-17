import { LilleAddress, ParisAddress, PlaineCommuneAddress } from '@db/db'
import * as cleanup from '@helpers/cleanup'
import { AddressSearchResult } from '@interfaces/shared'
import { formatParisPostalCode } from './city'

export interface AddressSearchStrategy {
  getAddressCompleted(query: string): Promise<AddressSearchResult>
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
