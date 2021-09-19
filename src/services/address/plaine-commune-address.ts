import { AddressService } from './address'
import Fuse from 'fuse.js'
import { Memoize } from 'typescript-memoize'
import path from 'path'
import * as fs from 'fs'
import { AddressItem, Coordinate } from '@interfaces/shared'
import { DistanceService } from '@services/distance'
import { PlaineCommuneAddressItem } from '@interfaces/json-item-plaine-commune'

export class PlaineCommuneAddressService extends AddressService {
  getStations(): string[] {
    return []
  }

  nearestStations(): string[] {
    return []
  }

  @Memoize()
  getAddressCompleted(query: string): {
    item: AddressItem
    score: number
    matches: ReadonlyArray<Fuse.FuseResultMatch>
  }[] {
    if (!query) {
      return null
    }

    const options = {
      keys: ['properties.nom_voie'],
      includeScore: true,
      includeMatches: true,
      useExtendedSearch: true,
      threshold: 0.5,
      minMatchCharLength: 3,
      ignoreLocation: true,
    }

    const index = Fuse.createIndex(
      options.keys,
      this.plaineCommuneAddressesJson()
    )

    const plaineCommuneFuse = new Fuse(
      this.plaineCommuneAddressesJson(),
      options,
      index
    )

    const result = plaineCommuneFuse.search(query, { limit: 10 }) as {
      item: PlaineCommuneAddressItem
      score: number
      matches: ReadonlyArray<Fuse.FuseResultMatch>
    }[]
    return result
      ? result.map((r) => ({
          item: {
            address: r.item.properties.numero + r.item.properties.nom_voie,
            postalCode: r.item.properties.code_posta.toString(),
            coordinate: {
              lng: +r.item.geometry.coordinates[0],
              lat: +r.item.geometry.coordinates[1],
            },
          },
          score: r.score,
          matches: r.matches as ReadonlyArray<Fuse.FuseResultMatch>,
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
