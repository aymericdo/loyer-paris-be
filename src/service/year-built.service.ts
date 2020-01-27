const db = require('./../db-emprise-batie')
const EmpriseBatie = db.EmpriseBatie

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

export async function getBuilding(lat, lng) {
    return await EmpriseBatie.findOne({
        geometry: {
            $near: {
                $geometry: { type: 'Point', coordinates: [lng, lat] },
                $maxDistance: 20,
            },
        },
    }, (err, batie) => {
        if (err) {
            console.log(err)
        }

        return batie
    })
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

export function getDateFormatted(periodBuilt) {
    if (!periodBuilt) {
        return null
    }

    if (periodBuilt.length > 1) {
        if (periodBuilt[0] === null) {
            return `Avant ${periodBuilt[1]}`
        } else if (periodBuilt[1] === null) {
            return `Après ${periodBuilt[0]}`
        } else {
            return `${periodBuilt[0]}-${periodBuilt[1]}`
        }
    } else {
        return periodBuilt
    }
}
