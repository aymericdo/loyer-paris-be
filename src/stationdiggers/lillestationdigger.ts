import { Ad } from "@interfaces/ad";
import { LilleStationItem } from "@interfaces/json-item-lille";
import { Coordinate } from "@interfaces/shared";
import { StationDigStrategy } from "@stationdiggers/stationdigger";
import { DistanceService } from "@services/distance";
import * as fs from 'fs';
import Fuse from "fuse.js";
import path from "path";


const lilleStations: LilleStationItem[] = JSON.parse(fs.readFileSync(path.join('json-data/stations_lille.json'), 'utf8'))

export class LilleStationDigger implements StationDigStrategy {
    distanceService: DistanceService;
    coordinates: Coordinate;
    blurryCoordinates: Coordinate;
    postalCode: string

    getStations(ad: Ad, postalCode: string): string[] {
        this.postalCode = postalCode
        const stations: LilleStationItem[] = ad.stations && this.getStationsFromFile(ad.stations)
            || ad.description && this.getStationsFromFile(ad.description.split(' '))
        return stations.map(station => station.fields.stop_name)
    }

    private getStationsFromFile(words: string[]): LilleStationItem[] {
        const options = {
            keys: ['fields.stop_name'],
            threshold: 0.2,
            includeScore: true,
        }

        if (!words) {
            return null
        }

        const fuse = new Fuse(lilleStations, options)
        return words.map((word) => {
            const res = word.length > 3 && fuse.search(word, { limit: 1 }) as { score: number, item: LilleStationItem }[]
            return res && res.length && res[0]
        }).filter(Boolean).sort((a, b) => a.score - b.score).map(a => a.item)
    }
}