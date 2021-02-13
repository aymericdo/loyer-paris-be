import * as fs from 'fs'
import * as path from 'path'
import * as cleanup from '@helpers/cleanup'
import { MetroItem } from '@interfaces/json-item'
import { Coordinate } from '@interfaces/shared'
import Fuse from 'fuse.js'

export class StationService {
    city: string
    stations: MetroItem[]
    keys: string[]

    constructor(city: string) {
        this.city = city
    }

    getCoordinate(station: string): Coordinate {
        switch (this.city) {
            case "paris": {
                this.keys = ["tags.name"]
                this.stations = JSON.parse(fs.readFileSync(path.join('json-data/metros_paris.json'), 'utf8'))
            }
            case "lille": {
                this.keys = ["fields.stop_name"]
                this.stations = JSON.parse(fs.readFileSync(path.join('transport_arret_transpole-point.json'), 'utf8'))
            }
        }
        const options = {
            keys: this.keys,
            shouldSort: true,
            threshold: 0.3,
            tokenize: true,
            matchAllTokens: true,
        }
        const fuse = new Fuse(this.stations, options)
        const result: any = fuse.search(station)
        if (result && result.length) {
            switch (this.city) {
                case "paris": {
                    return { lat: result[0].lat, lng: result[0].lon }
                }
                case "lille": {
                    return { lat: result[0].Coordinates[0], lng: result[0].Coordinates[1] } as Coordinate
                }
            }
        }
        return result && result.length && { lat: result[0].lat, lng: result[0].lon }
    }

    getStations(description: string): string[] {
        return [...new Set(this.stations.map(station => {
            if (station.tags && description.search(cleanup.string(station.tags.name)) !== -1) {
                return cleanup.string(station.tags.name)
            }
        }).filter(Boolean))]
    }
}
