import { min } from '@helpers/functions';
import { Ad } from '@interfaces/ad';
import { ArrondissementItem, ParisStationItem } from '@interfaces/json-item-paris';
import { Coordinate } from '@interfaces/shared';
import { StationDigStrategy } from "@stationdiggers/stationdigger";
import { DistanceService } from '@services/distance';
import * as fs from 'fs';
import Fuse from 'fuse.js';
import path from "path";
import inside from 'point-in-polygon';
import { Memoize } from 'typescript-memoize';


const parisStations: ParisStationItem[] = JSON.parse(fs.readFileSync(path.join('json-data/stations_paris.json'), 'utf8'))
const parisArrondissements: { features: ArrondissementItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/arrondissements_paris_geodata.json'), 'utf8'))

export class ParisStationDigger implements StationDigStrategy {
    distanceService: DistanceService;
    coordinates: Coordinate;
    blurryCoordinates: Coordinate;
    postalCode: string

    getStations(ad: Ad, postalCode: string): string[] {
        this.postalCode = postalCode
        const stations: ParisStationItem[] = ad.stations && this.getStationsFromFile(ad.stations)
            || ad.description && this.getStationsFromFile(ad.description.split(' '))
        return stations && this.nearestStationInTargetPolygon(stations)
    }

    private getStationsFromFile(words: string[]): ParisStationItem[] {
        const options = {
            keys: ['tags.name'],
            threshold: 0.2,
            includeScore: true,
        }

        if (!words.length) {
            return null
        }

        const fuse = new Fuse(parisStations, options)
        return words.map((word) => {
            const res = word.length > 3 && fuse.search(word, { limit: 1 }) as { score: number, item: ParisStationItem }[]
            return res && res.length && res[0]
        }).filter(Boolean).sort((a, b) => a.score - b.score).map(a => a.item)
    }

    private nearestStationInTargetPolygon(stations: ParisStationItem[]): string[] {
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

    private setCoordinates(coord: Coordinate, streetNumber: number): void {
        if (streetNumber) {
            this.coordinates = { ...coord }
        } else {
            this.blurryCoordinates = { ...coord }
        }
    }

    @Memoize()
    private getPolyFromPostalCode(): number[][] {
        if (!this.postalCode) return null // Bretelles + ceinture

        const code = this.postalCodeReformat(this.postalCode)
        return parisArrondissements.features.find(a => a.properties.c_ar === +code).geometry.coordinates[0]
    }

    // This function return a polygon we found relevant for a city to increase the precision of the address
    getTargetPolygon(postalCode: string): number[][] {
        let targetPolygon = null

        if (postalCode) {
            targetPolygon = this.getPolyFromPostalCode()
        }

        return targetPolygon
    }

    private augmentElementItemList(stations: ParisStationItem[]): { point: Coordinate, dist: number, name: string }[] {
        const targetPolygon = this.getTargetPolygon(this.postalCode)
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


    private postalCodeReformat(postalCode: string): string {
        // 75010 -> 10 75009 -> 9
        return (postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2))
    }
}