import { AddressService } from "./address";
import Fuse from 'fuse.js';
import { Memoize } from 'typescript-memoize';
import path from "path";
import * as fs from 'fs';
import { AddressItem, Coordinate } from '@interfaces/shared';
import { DistanceService } from '@services/distance';
import { LilleAddressItem } from '@interfaces/json-item-lille';

export class LilleAddressService extends AddressService {
  @Memoize()
  getAddressCompleted(query: string,): { item: AddressItem, score: number, matches: ReadonlyArray<Fuse.FuseResultMatch> }[] {
      if (!query) {
          return null
      }

      const options = {
        keys: ['fields.auto_adres'],
        includeScore: true,
        threshold: 0.5,
        minMatchCharLength: 3,
      }

      const index = Fuse.createIndex(options.keys, this.lilleAddressesJson().filter(address => address.fields.nomcom.toLowerCase() === this.city))

      const lilleFuse = new Fuse(this.lilleAddressesJson(), options, index)

      const result = lilleFuse.search(query, { limit: 10 }) as { item: LilleAddressItem, score: number, matches: ReadonlyArray<Fuse.FuseResultMatch> }[]
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
        matches: r.matches as ReadonlyArray<Fuse.FuseResultMatch>,
      })) : []
  }

  addressFromCoordinate(coord: Coordinate): string {
    return (this.lilleAddressesJson().reduce((prev, current) => {
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

  @Memoize()
  private lilleAddressesJson(): LilleAddressItem[] {
    return JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'));
  }
}
