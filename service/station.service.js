const fs = require('fs')
const Fuse = require('fuse.js')

const parisStations = JSON.parse(fs.readFileSync('json-data/metros_paris.json', 'utf8'))

function getCoordinate(station) {
    const options = {
        keys: ['tags.name'],
        shouldSort: true,
        threshold: 0.2,
        tokenize: true,
        matchAllTokens: true,
    }
    const fuse = new Fuse(parisStations, options)
    const result = fuse.search(station)
    return result && { lat: result[0].lat, lng: result[0].lon }
}

module.exports = {
    getCoordinate,
}
