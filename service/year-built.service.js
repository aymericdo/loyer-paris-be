const fs = require('fs')
const turf = require('turf')
const inside = require('point-in-polygon')

const empriseBatieParis = JSON.parse(fs.readFileSync('json-data/EMPRISE_BATIE_PARIS.geojson', 'utf8'))

function getYearRange(rangeRents, yearBuilt) {
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

function getBuilding(lat, lng, postalCode) {
    const building = empriseBatieParis.features.find(building => inside([lng, lat], building.geometry.coordinates[0]))
    const distances = empriseBatieParis.features.filter(building => building.properties.n_sq_eb.toString().startsWith(postalCode))
        .map(building => {
            try {
                const polygon = turf.polygon(building.geometry.coordinates)
                const center = turf.centroid(polygon)
                const to = turf.point([lat, lng])
                return turf.distance(center, to)
            } catch {
                return
            }
        })

    const indexOfMinValue = distances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0)
    return building || empriseBatieParis.features[indexOfMinValue]
}

function getYearBuiltFromBuilding(building) {
    const yearBuilt = building && building.properties.an_const && [+building.properties.an_const]
    const periodBuilt = building && building.properties.c_perconst &&
        building.properties.c_perconst.toLowerCase().includes("avant") ?
        [null, +building.properties.c_perconst.slice(-4)] :
        building.properties.c_perconst.toLowerCase().includes("après") ?
            [+building.properties.c_perconst.slice(-4), null] :
            [+building.properties.c_perconst.slice(0, 4), +building.properties.c_perconst.slice(-4)]
    return yearBuilt || periodBuilt
}

module.exports = {
    getYearRange,
    getBuilding,
    getYearBuiltFromBuilding,
}
