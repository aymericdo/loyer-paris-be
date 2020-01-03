const fs = require('fs')
const turf = require('turf')
const inside = require('point-in-polygon')

const parcelle_cadastrale_paris = JSON.parse(fs.readFileSync('json-data/PARCELLE_CADASTRALE_PARIS.geojson', 'utf8'))
const emprise_batie_paris = JSON.parse(fs.readFileSync('json-data/EMPRISE_BATIE_PARIS.geojson', 'utf8'))

function getYearRange(rangeRents, yearBuilt) {
    if (!yearBuilt) {
        return null
    }
    const firstRangeRent = rangeRents.find((rangeRent) => {
        const yearBuiltRange = rangeRent.fields.epoque
            .split(/[\s-]+/)
            .map(year => isNaN(year) ? year.toLowerCase() : +year)

        return (typeof yearBuiltRange[0] === 'number') ?
            yearBuiltRange[0] < yearBuilt && yearBuiltRange[1] >= yearBuilt
            : (yearBuiltRange[0] === 'avant') ?
                yearBuilt < yearBuiltRange[1]
                : (yearBuiltRange[0] === 'apres') ?
                    yearBuilt > yearBuiltRange[1]
                    :
                    false
    })

    return firstRangeRent ? firstRangeRent.fields.epoque : null
}

function getParcelleCadastrale(lat, lng) {
    const parcelle = parcelle_cadastrale_paris.features.find(parcelle => inside([lng, lat], parcelle.geometry.coordinates[0]))
    return parcelle || null
}

function getBuilding(lat, lng, postalCode) {
    const building = emprise_batie_paris.features.find(building => inside([lng, lat], building.geometry.coordinates[0]))
    const distances = emprise_batie_paris.features.filter(building => building.properties.n_sq_eb.toString().startsWith(postalCode))
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
    return building || emprise_batie_paris.features[indexOfMinValue] || null
}

module.exports = {
    getYearRange,
    getParcelleCadastrale,
    getBuilding,
}
