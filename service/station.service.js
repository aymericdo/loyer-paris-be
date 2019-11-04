const fs = require('fs')
const Fuse = require('fuse.js')
const cleanup = require('helper/cleanup.helper')

const parisStations = JSON.parse(fs.readFileSync('json-data/metros_paris.json', 'utf8'))

function getCoordinate(station) {
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

function getStations(description) {
    return [...new Set(parisStations.map(station => {
        if (station.tags && description.search(cleanup.string(station.tags.name)) !== -1) {
            return station.tags.name
        }
    }).filter(Boolean))]
}

module.exports = {
    getCoordinate,
    getStations,
}
