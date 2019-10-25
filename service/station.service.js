const fs = require('fs')
const log = require('helper/log.helper')
const inside = require('point-in-polygon')
const Fuse = require('fuse')

const parisStations = JSON.parse(fs.readFileSync('json-data/metros_paris.json', 'utf8'))

function getCoordinate(station) {
    var options = {
        keys: ['tags.name'],
        id: 'id'
      }
    var fuse = new Fuse(parisStations, options)
    var result = fuse.search(station)
    return result && {lat: result.lat, lng: result.lng}
}

module.exports = {
    getCoordinate,
}
