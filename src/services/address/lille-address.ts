import * as cleanup from '@helpers/cleanup'
import { AddressService } from "./address";
import Fuse from 'fuse.js';
import { Memoize } from 'typescript-memoize';
import path from "path";
import * as fs from 'fs';
import { AddressItem, Coordinate } from '@interfaces/shared';
import { DistanceService } from '@services/distance';
import { LilleAddressItem } from '@interfaces/json-item-lille';

const lilleAddresses: LilleAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'))

const options = {
  keys: ['fields.auto_adres'],
  includeScore: true,
  threshold: 0.5,
  minMatchCharLength: 3,
}

const index = Fuse.createIndex(options.keys, lilleAddresses)

const lilleFuse = new Fuse(lilleAddresses, options, index)

export class LilleAddressService extends AddressService {
  city = 'lille'

  @Memoize()
  getAddressCompleted(q: string, limit: number): { item: AddressItem, score: number }[] {
      const cleanAddress = cleanup.address(q, this.city)

      if (!cleanAddress) {
          return null
      }

      const result = lilleFuse.search(cleanAddress, { limit }) as { item: LilleAddressItem, score: number }[]
      return result ? result.map((r) => ({
        item: {
          address: r.item.fields.auto_adres,
          postalCode: r.item.fields.cpostal.toString(),
          coordinate: {
            lng: r.item.geometry.coordinates[0],
            lat: r.item.geometry.coordinates[1],
          },
        },
        score: r.score,
      })) : []
  }

  addressFromCoordinate(coord: Coordinate): string {
    return (lilleAddresses.reduce((prev, current) => {
        const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.geometry.coordinates[1], current.geometry.coordinates[0])
        if (dist < prev.dist || !prev.dist) {
            prev = { dist, current }
        }
        return prev;
    }, {} as { current: any, dist: number }))?.current?.fields?.auto_adres;
  }

  // This function return a polygon we found relevant for a city to increase the precision of the address
  // Lille, it's happening...
  getTargetPolygon(): number[][] {
    return null
  }
}
