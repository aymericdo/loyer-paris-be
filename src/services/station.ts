import * as fs from 'fs'
import * as path from 'path'
import * as cleanup from '@helpers/cleanup'
import { Coordinate, MetroItem } from './interfaces';
const Fuse = require('fuse.js')

let parisStations: MetroItem[] = null
fs.readFile(path.join('json-data/metros_paris.json'), 'utf8', (error, data) => {
    parisStations = JSON.parse(data)
})

export function getCoordinate(station: string): Coordinate {
    const options = {
        keys: ['tags.name'],
        shouldSort: true,
        threshold: 0.3,
        tokenize: true,
        matchAllTokens: true,
    }
    const fuse = new Fuse(parisStations, options)
    const result = fuse.search(station)
    return result && result.length && { lat: result[0].lat, lng: result[0].lon }
}

export function getStations(description: string): string[] {
    return [...new Set(parisStations.map(station => {
        if (station.tags && description.search(cleanup.string(station.tags.name)) !== -1) {
            return cleanup.string(station.tags.name)
        }
    }).filter(Boolean))]
}
