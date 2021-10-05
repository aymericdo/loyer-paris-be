import { AddressService } from './address'
import * as cleanup from '@helpers/cleanup'
import { Memoize } from 'typescript-memoize'
import path from 'path'
import * as fs from 'fs'
import { AddressItem, Coordinate } from '@interfaces/shared'
import { DistanceService } from '@services/distance'
import { PlaineCommuneAddressItem } from '@interfaces/json-item-plaine-commune'
import { PlaineCommuneAddress } from '@db/db'

export class PlaineCommuneAddressService extends AddressService {
  getStations(): string[] {
    return []
  }

  nearestStations(): string[] {
    return []
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
    return this.plaineCommuneAddressesJson().reduce((prev, current) => {
      const dist = DistanceService.getDistanceFromLatLonInKm(
        coord.lat,
        coord.lng,
        current.geometry.coordinates[1],
        current.geometry.coordinates[0]
      )
      if (dist < prev.dist || !prev.dist) {
        prev = { dist, current }
      }
      return prev
    }, {} as { current: any; dist: number })?.current?.fields?.auto_adres
  }

  getTargetPolygon(): number[][] {
    return null
  }

  @Memoize()
  private plaineCommuneAddressesJson(): PlaineCommuneAddressItem[] {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/adresse_plaine-commune.geojson'),
        'utf8'
      )
    ).features
  }
}
