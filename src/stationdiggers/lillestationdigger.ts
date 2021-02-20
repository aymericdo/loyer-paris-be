import { Ad } from "@interfaces/ad";
import { ParisAddressItem } from "@interfaces/json-item";
import { StationDigStrategy } from "@interfaces/stationdigger";
import * as fs from 'fs';
import path from "path";


const lilleAddresses: ParisAddressItem[] = JSON.parse(fs.readFileSync(path.join('json-data/adresse_lille.json'), 'utf8'))

export class LilleStationDigger implements StationDigStrategy {
    getStations(ad: Ad, postalCode: string): string[] {
        return []
    }
}