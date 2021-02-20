import * as fs from 'fs'
import * as path from 'path'
import Fuse from 'fuse.js'
import { ParisStationItem } from '@interfaces/json-item'

const parisStations: ParisStationItem[] = JSON.parse(fs.readFileSync(path.join('json-data/metros_stations.json'), 'utf8'))

export class StationService {
    description: string = null

    constructor(
        description: string,
    ) {
        this.description = description
    }

    getStations(): ParisStationItem[] {
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
            const res = word.length > 3 && fuse.search(word, { limit: 1 }) as { score: number, item: ParisStationItem }[]
            return res && res.length && res[0]
        }).filter(Boolean).sort((a, b) => a.score - b.score).map(a => a.item)
    }
}
