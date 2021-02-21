import { min } from '@helpers/functions';
import { regexString } from '@helpers/regex';
import { ArrondissementItem, MetroItem, ParisAddressItem } from '@interfaces/json-item-paris';
import { ParisStationService } from '@services/address/paris-station';
import Fuse from 'fuse.js';
import * as cleanup from '@helpers/cleanup'
import inside from 'point-in-polygon';
import { Memoize } from 'typescript-memoize';
import { AddressService } from './address';
import { AddressItem, Coordinate } from '@interfaces/shared';
import { DistanceService } from '@services/distance';
import * as fs from 'fs'
import path from "path";

import * as log from '@helpers/log'

const parisAddresses: ParisAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_paris.json'), 'utf8'))
const parisArrondissements: { features: ArrondissementItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/arrondissements_paris_geodata.json'), 'utf8'))

const options = {
  keys: ['fields.l_adr'],
  includeScore: true,
  threshold: 0.5,
  minMatchCharLength: 3,
}

const index = Fuse.createIndex(options.keys, parisAddresses)

const parisFuse = new Fuse(parisAddresses, options, index)
export class ParisAddressService extends AddressService {
  city = 'paris'

  getStations(): string[] {
    const stations: MetroItem[] = this.ad.stations && ParisStationService.getStations(this.ad.stations)
      || this.ad.description && ParisStationService.getStations(this.ad.description.split(' '))
    return stations && this.nearestStationInTargetPolygon(stations)
  }

  digForPostalCode2(text: string): string {
    const postalCode2Re = new RegExp(regexString(`postalCode2_${this.city}`))
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
  }

  @Memoize()
  getAddressCompleted(q: string, limit: number): { item: AddressItem, score: number }[] {
    const cleanAddress = cleanup.address(q, this.city)

    if (!cleanAddress) {
        return null
    }
    const result = parisFuse.search(cleanAddress, { limit }) as { item: ParisAddressItem, score: number }[]
    return result ? result.map((r) => ({
      item: {
        address: r.item.fields.l_adr,
        coordinate: {
          lng: r.item.fields.geom.coordinates[0],
          lat: r.item.fields.geom.coordinates[1],
        },
      },
      score: r.score,
    })) : []
  }

  addressFromCoordinate(coord: Coordinate): string {
    return (parisAddresses.reduce((prev, current) => {
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

    if (this.getPostalCode()) {
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
    if (!this.getPostalCode()) return null // Bretelles + ceinture

    const postalCode = this.getPostalCode()
    // 75010 -> 10 75009 -> 9
    const code = (postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2))
    return parisArrondissements.features.find(a => a.properties.c_ar === +code).geometry.coordinates[0]
  }
}
