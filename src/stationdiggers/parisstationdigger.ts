import { min } from '@helpers/functions';
import { Ad } from '@interfaces/ad';
import { ParisStationItem } from '@interfaces/json-item';
import { Coordinate } from '@interfaces/shared';
import { StationDigStrategy } from "@interfaces/stationdigger";
import { DistanceService } from '@services/distance';
import * as fs from 'fs';
import Fuse from 'fuse.js';
import path from "path";
import inside from 'point-in-polygon';


const parisStations: ParisStationItem[] = JSON.parse(fs.readFileSync(path.join('json-data/metros_stations.json'), 'utf8'))

export class ParisStationDigger implements StationDigStrategy {
    distanceService: DistanceService;
    blurryCoordinates: Coordinate;

    getStations(ad: Ad, postalCode: string): string[] {
        const stationsFromDescription: ParisStationItem[] = ad?.description && this.getStationsFromFile(ad.description)
        this.distanceService = new DistanceService(postalCode)
        return ad.stations || stationsFromDescription && (postalCode && this.nearestPointInPostalCode(stationsFromDescription))

    }
    getPostalCode() {
        throw new Error('Method not implemented.');
    }

    private getStationsFromFile(description: string): ParisStationItem[] {
        const options = {
            keys: ['tags.name'],
            threshold: 0.2,
            includeScore: true,
        }

        if (!description) {
            return null
        }

        const fuse = new Fuse(parisStations, options)
        return description.split(' ').map((word) => {
            const res = word.length > 3 && fuse.search(word, { limit: 1 }) as { score: number, item: ParisStationItem }[]
            return res && res.length && res[0]
        }).filter(Boolean).sort((a, b) => a.score - b.score).map(a => a.item)
    }

    private nearestPointInPostalCode(metroItems: ParisStationItem[]): string[] {
        const postalCodePolygon = this.distanceService.getPolyFromPostalCode()

        if (!postalCodePolygon) return null

        const pointByDist = metroItems.map(metro => {
            const point = [metro.lon, metro.lat]
            if (inside(point, postalCodePolygon)) {
                return { point, dist: 0, name: metro.tags.name }
            } else {
                // Get the closest coord but in the right postalCode
                return { ...this.distanceService.distanceToPoly(point as [number, number], postalCodePolygon as [number, number][]), name: metro.tags.name };
            }
        });

        if (!pointByDist.length) return null

        if (pointByDist[0].dist === 0) {
            const insidePostalCodeCase = pointByDist[0] as { name: string, point: number[] };
            this.blurryCoordinates = { lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] };
        } else {
            const bah = min(pointByDist, 'dist')

            // marge d'erreur : 250m
            if (bah.dist < 0.0025) {
                this.blurryCoordinates = { lng: bah.point[0], lat: bah.point[1] }
            }
        }

        return pointByDist.reduce((prev, point) => {
            if (point.dist < 0.0025 && prev.every(elem => elem !== point.name)) {
                prev.push(point.name);
            }
            return prev;
        }, []);
    }
}