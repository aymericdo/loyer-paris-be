import * as fs from 'fs'
import * as path from 'path'
import { MetroItem } from '@interfaces/json-item'
import Fuse from 'fuse.js'

export class StationService {
    city: string
    stations: MetroItem[]
    keys: string[]

    constructor(city: string) {
        this.city = city
        if (this.city === "paris") {
            this.keys = ["tags.name"]
            this.stations = JSON.parse(fs.readFileSync(path.join('json-data/metros_paris.json'), 'utf8'))
        }
        else if (this.city === "lille") {
            this.keys = ["fields.stop_name"]
            this.stations = JSON.parse(fs.readFileSync(path.join('json-data/transport_arret_transpole-point.json'), 'utf8'))
        }
        else {
            console.error("city not correct for district")
        }

    }

    getCoordinate(station: string): Coordinate {
        const options = {
            keys: this.keys,
            threshold: 0.2,
            includeScore: true,
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

    getStations(): MetroItem[] {
        const options = {
            keys: ['tags.name'],
            threshold: 0.2,
            includeScore: true,
        }

        if (!this.description) {
            return null
        }

        const fuse = new Fuse(parisStations, options)
        return this.description.split(' ').map((word) => {
            const res = word.length > 3 && fuse.search(word, { limit: 1 }) as { score: number, item: MetroItem }[]
            return res && res.length && res[0]
        }).filter(Boolean).sort((a, b) => a.score - b.score).map(a => a.item)
    }
}
