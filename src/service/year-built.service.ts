import * as fs from 'fs'
import * as path from 'path'
const turf = require('turf')
const inside = require('point-in-polygon')
const json = require('big-json')

const empriseBatieParisReadStream = fs.createReadStream(path.join(__dirname, '../json-data/EMPRISE_BATIE_PARIS.geojson'))
const empriseBatieParisParseStream = json.createParseStream()

let empriseBatieParis = null
empriseBatieParisParseStream.on('data', (data) => {
    empriseBatieParis = data
})
empriseBatieParisReadStream.pipe(empriseBatieParisParseStream)

export function getYearRange(rangeRents, yearBuilt) {
    if (!yearBuilt) {
        return null
    }
    const rangeRentsSorted = yearBuilt.map((yb) => {
        return rangeRents.find((rangeRent) => {
            const yearBuiltRange = rangeRent.fields.epoque
                .split(/[\s-]+/)
                .map(year => isNaN(year) ? year.toLowerCase() : +year)

            return (typeof yearBuiltRange[0] === 'number') ?
                yearBuiltRange[0] < yb && yearBuiltRange[1] >= yb
                : (yearBuiltRange[0] === 'avant') ?
                    yb < yearBuiltRange[1]
                    : (yearBuiltRange[0] === 'apres') ?
                        yb > yearBuiltRange[1]
                        :
                        false
        })
    }).sort(function (a, b) { return b.fields.max - a.fields.max })

    const firstRangeRent = rangeRentsSorted && rangeRentsSorted[0]
    return firstRangeRent ? firstRangeRent.fields.epoque : null
}

export function getBuilding(lat, lng, postalCode) {
    return null
    // return new Promise(resolve => {
    //     const building = empriseBatieParis.features.find(building => inside([lng, lat], building.geometry.coordinates[0]))
    //     const distances = empriseBatieParis.features.filter(building => building.properties.n_sq_eb.toString().startsWith(postalCode))
    //         .map(building => {
    //             try {
    //                 const polygon = turf.polygon(building.geometry.coordinates)
    //                 const center = turf.centroid(polygon)
    //                 const to = turf.point([lat, lng])
    //                 return turf.distance(center, to)
    //             } catch {
    //                 return
    //             }
    //         })

    //     const indexOfMinValue = distances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0)
    //     resolve(building || empriseBatieParis.features[indexOfMinValue])
    // })
}

export function getYearBuiltFromBuilding(building) {
    const yearBuilt = building && building.properties.an_const && [+building.properties.an_const]
    const periodBuilt = building && building.properties.c_perconst && (
        building.properties.c_perconst.toLowerCase().includes("avant") ?
            [null, +building.properties.c_perconst.slice(-4)] :
            building.properties.c_perconst.toLowerCase().includes("après") ?
                [+building.properties.c_perconst.slice(-4), null] :
                [+building.properties.c_perconst.slice(0, 4), +building.properties.c_perconst.slice(-4)]
    )
    return yearBuilt || periodBuilt
}
