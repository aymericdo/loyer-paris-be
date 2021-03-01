import { min } from '@helpers/functions';
import { ArrondissementItem, MetroItem, ParisAddressItem } from '@interfaces/json-item-paris';
import { ParisStationService } from '@services/address/paris-station';
import Fuse from 'fuse.js';
import inside from 'point-in-polygon';
import { Memoize } from 'typescript-memoize';
import { AddressService } from './address';
import { AddressItem, Coordinate } from '@interfaces/shared';
import { DistanceService } from '@services/distance';
import * as fs from 'fs'
import path from "path";
import { cityList } from './city';

export class ParisAddressService extends AddressService {
  getStations(): string[] {
    const parisStationService = new ParisStationService()
    const stations: MetroItem[] = this.ad.stations && parisStationService.getStations(this.ad.stations)
      || this.ad.description && parisStationService.getStations(this.ad.description.split(' '))
    return stations && this.nearestStationInTargetPolygon(stations)
  }

  digForPostalCode2(text: string): string {
    const postalCode2Re = new RegExp(cityList[this.city].postalCodeRegex[1]);
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
  }

  @Memoize()
  getAddressCompleted(address: string, limit: number): { item: AddressItem, score: number }[] {
    if (!address) {
        return null
    }

    const options = {
      keys: ['fields.l_adr'],
      includeScore: true,
      threshold: 0.5,
      minMatchCharLength: 3,
    }
    
    const index = Fuse.createIndex(options.keys, this.parisAddressesJson())

    const parisFuse = new Fuse(this.parisAddressesJson(), options, index)

    const result = parisFuse.search(address, { limit }) as { item: ParisAddressItem, score: number }[]
    return result ? result.map((r) => ({
      item: {
        address: r.item.fields.l_adr,
        postalCode: this.postalCodeFormat(r.item.fields.c_ar.toString()),
        coordinate: {
          lng: r.item.fields.geom.coordinates[0],
          lat: r.item.fields.geom.coordinates[1],
        },
      },
      score: r.score,
    })) : []
  }

  addressFromCoordinate(coord: Coordinate): string {
    return (this.parisAddressesJson().reduce((prev, current) => {
        const dist = DistanceService.getDistanceFromLatLonInKm(coord.lat, coord.lng, current.fields.geom.coordinates[1], current.fields.geom.coordinates[0])
        if (dist < prev.dist || !prev.dist) {
            prev = { dist, current }
        }
        return prev;
    }, {} as { current: any, dist: number }))?.current?.fields?.l_adr;
  }

  // This function return a polygon we found relevant for a city to increase the precision of the address
  getTargetPolygon(): number[][] {
    let targetPolygon = null

    if (this.digForPostalCode()) {
      targetPolygon = this.getPolyFromPostalCode()
    }

    return targetPolygon
  }

  private nearestStationInTargetPolygon(stations: MetroItem[]): string[] {
    const pointsByDist: { point: Coordinate, dist: number, name: string }[] = this.augmentElementItemList(stations)

    if (!pointsByDist.length) return null

    // marge d'erreur : 250m
    const confidenceThreshold = 0.0025

    if (pointsByDist[0].dist === 0) {
      const insidePostalCodeCase = pointsByDist[0] as { name: string, dist: number, point: Coordinate };
      this.setCoordinates(insidePostalCodeCase.point, null)
    } else {
      const bah = min(pointsByDist, 'dist')

      if (bah.dist < confidenceThreshold) {
        this.setCoordinates(bah.point, null)
      }
    }

    return pointsByDist.reduce((prev, point) => {
        if (point.dist < confidenceThreshold && prev.every(elem => elem !== point.name)) {
          prev.push(point.name);
        }
        return prev;
    }, []);
  }

  private augmentElementItemList(stations: MetroItem[]): { point: Coordinate, dist: number, name: string }[] {
    const targetPolygon = this.getTargetPolygon()
    if (!targetPolygon) return null

    return stations.map(metro => {
      const point = [metro.lon, metro.lat]
      if (inside(point, targetPolygon)) {
        return {
          point: {
            lng: point[0],
            lat: point[1],
          },
          dist: 0,
          name: metro.tags.name,
        }
      } else {
        // Get the closest coord but in the right targetPolygon (postalCode)
        const result = DistanceService.distanceToPoly(point as [number, number], targetPolygon as [number, number][])
        return {
          point: {
            lng: result.point[0],
            lat: result.point[1],
          },
          dist: result.dist,
          name: metro.tags.name,
        };
      }
    });
  }

  @Memoize()
  private getPolyFromPostalCode(): number[][] {
    if (!this.digForPostalCode()) return null // Bretelles + ceinture

    const code = this.postalCodeReformat(this.digForPostalCode())
    return this.parisArrondissementsJson().features.find(a => a.properties.c_ar === +code).geometry.coordinates[0]
  }

  @Memoize()
  private parisAddressesJson(): ParisAddressItem[] {
    return JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))
  }

  @Memoize()
  private parisArrondissementsJson(): { features: ArrondissementItem[] } {
    return JSON.parse(fs.readFileSync(path.join('json-data/arrondissements_paris_geodata.json'), 'utf8'))
  }
  
  private postalCodeFormat(postalCode: string): string {
    // 10 -> 75010 9 -> 75009
    return (postalCode.length === 1) ?
      `7500${postalCode}`
    :
      `750${postalCode}`
  }

  private postalCodeReformat(postalCode: string): string {
    // 75010 -> 10 75009 -> 9
    return (postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2))
  }
}
