const fs = require('fs')
const log = require('helper/log.helper')
const inside = require('point-in-polygon')
const Fuse = require('fuse.js')

const parisStations = JSON.parse(fs.readFileSync('json-data/metros_paris.json', 'utf8'))

function getCoordinate(station) {
    const options = {
        keys: ['tags.name'],
    }
    const fuse = new Fuse(parisStations, options)
    const result = fuse.search(station)
    return result && { lat: result[0].lat, lng: result[0].lon }
}

module.exports = {
    getCoordinate,
}
