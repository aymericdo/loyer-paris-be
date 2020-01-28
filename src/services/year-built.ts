import { EmpriseBatie } from '@db/db'
import { EncadrementItem } from '@interfaces/json-item'

export function getYearRange(rangeRents: EncadrementItem[], yearBuilt): string {
    if (!yearBuilt) {
        return null
    }

    const yearBuiltRange = yearBuilt.length > 1 ?
        Array.from({ length: yearBuilt[1] - yearBuilt[0] + 1 }, (v, k) => yearBuilt[0] + k)
        :
        yearBuilt

    const rangeRentsSorted = yearBuiltRange.map((yb: number) => {
        return rangeRents.find((rangeRent: EncadrementItem) => {
            const encadrementYearBuilt: (string | number)[] = rangeRent.fields.epoque
                .split(/[\s-]+/)
                .map((year: any) => isNaN(year) ? year.toLowerCase() : +year)

            return (typeof encadrementYearBuilt[0] === 'number') ?
                encadrementYearBuilt[0] < yb && encadrementYearBuilt[1] >= yb
                : (encadrementYearBuilt[0] === 'avant') ?
                    yb < encadrementYearBuilt[1]
                    : (encadrementYearBuilt[0] === 'apres') ?
                        yb > encadrementYearBuilt[1]
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
