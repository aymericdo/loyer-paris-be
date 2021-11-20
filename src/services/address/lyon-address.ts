import { LyonAddress } from '@db/db'
import * as cleanup from '@helpers/cleanup'
import { AddressItem, Coordinate } from '@interfaces/shared'
import { Memoize } from 'typescript-memoize'
import { AddressService } from './address'
import { cityList } from './city'

export class LyonAddressService extends AddressService {
  getStations(): string[] {
    return []
  }

  nearestStations(): string[] {
    return []
  }

  digForPostalCode2(text: string): string {
    const postalCode2Re =
      this.city === 'lyon' && new RegExp(cityList[this.city].postalCodeRegex[1])
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match
      ? match.trim().length === 1
        ? `6900${match.trim()}`
        : `690${match.trim()}`
      : null
  }

  @Memoize()
  async getAddressCompleted(query: string): Promise<
    {
      item: AddressItem
      score: number
      streetNumber: string
    }[]
  > {
    if (!query) {
      return null
    }
    const result = (await LyonAddress.find(
      {
        $text: { $search: query.toString() },
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

  addressFromCoordinate(coord: Coordinate): string {
    return
  }

  getTargetPolygon(): number[][] {
    return null
  }
}
