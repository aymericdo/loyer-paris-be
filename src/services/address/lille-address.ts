import { AddressService } from './address'
import Fuse from 'fuse.js'
import { Memoize } from 'typescript-memoize'
import path from 'path'
import * as fs from 'fs'
import { AddressItem, Coordinate } from '@interfaces/shared'
import { DistanceService } from '@services/distance'
import { LilleAddressItem, LilleStationItem } from '@interfaces/json-item-lille'
import { LilleStationService } from './lille-station'

export class LilleAddressService extends AddressService {
  getStations(): string[] {
    // const lilleStationService = new LilleStationService();
    // const stations: LilleStationItem[] =
    //   (this.ad.stations && lilleStationService.getStations(this.ad.stations)) ||
    //   (this.ad.description &&
    //     lilleStationService.getStations(this.ad.description.split(" ")));
    // return stations && this.nearestStations(stations);
    // commented for now
    return [];
  }

  nearestStations(stations: LilleStationItem[]): string[] {
    return stations
      .filter((station) => station.fields.stop_desc.includes(this.postalCode))
      .map((station) => station.fields.stop_name)
  }

  @Memoize()
  getAddressCompleted(
    query: string
  ): {
    item: AddressItem
    score: number
    matches: ReadonlyArray<Fuse.FuseResultMatch>
  }[] {
    if (!query) {
      return null;
    }

    const options = {
      keys: ["tags.address"],
      includeScore: true,
      includeMatches: true,
      useExtendedSearch: true,
      threshold: 0.5,
      minMatchCharLength: 3,
      ignoreLocation: true,
    }

    const index = Fuse.createIndex(options.keys, this.lilleAddressesJson());

    const lilleFuse = new Fuse(this.lilleAddressesJson(), options, index);

    const result = lilleFuse.search(query, { limit: 10 }) as {
      item: LilleAddressItem
      score: number
      matches: ReadonlyArray<Fuse.FuseResultMatch>
    }[]
    return result
      ? result.map((r) => ({
          item: {
            address: r.item.tags.address,
            postalCode: r.item.tags.postcode,
            coordinate: {
              lng: +r.item.lon,
              lat: +r.item.lat,
            },
          },
          score: r.score,
          matches: r.matches as ReadonlyArray<Fuse.FuseResultMatch>,
        }))
      : []
  }

  addressFromCoordinate(coord: Coordinate): string {
    return this.lilleAddressesJson().reduce((prev, current) => {
      const dist = DistanceService.getDistanceFromLatLonInKm(
        coord.lat,
        coord.lng,
        current.lat,
        current.lon
      )
      if (dist < prev.dist || !prev.dist) {
        prev = { dist, current };
      }
      return prev
    }, {} as { current: any; dist: number })?.current?.fields?.auto_adres
  }

  // This function return a polygon we found relevant for a city to increase the precision of the address
  // Lille, it's happening...
  getTargetPolygon(): number[][] {
    return null;
  }

  @Memoize()
  private lilleAddressesJson(): LilleAddressItem[] {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8')
    ).elements
  }
}
