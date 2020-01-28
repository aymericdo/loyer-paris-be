import * as fs from 'fs'
import * as path from 'path'
import * as yearBuiltService from '@services/year-built'
import * as log from '@helpers/log'
import * as addressService from '@services/address'
import { EncadrementItem } from '@interfaces/json-item'
import { Coordinate } from '@interfaces/shared'

interface DetectedInfo {
    coordinates: Coordinate
    hasFurniture: boolean
    postalCode: string
    roomCount: number
    stations: string[]
    yearBuilt: number[]
}

let rangeRents: EncadrementItem[] = null
fs.readFile(path.join('json-data/encadrements.json'), 'utf8', (error, data) => {
    rangeRents = JSON.parse(data)
})

export const rentFilter = ({
    coordinates,
    hasFurniture,
    postalCode,
    roomCount,
    stations,
    yearBuilt,
}: DetectedInfo): EncadrementItem => {
    log.info('rent filter start')

    const result = addressService.getDistricts(coordinates, postalCode, stations)
    const yearRange = yearBuiltService.getYearRange(rangeRents, yearBuilt)

    const rentList = rangeRents.filter((rangeRent) => {
        return (result.districts && result.districts.filter(Boolean).length ? result.districts.map(district => district.fields.c_qu).includes(rangeRent.fields.id_quartier) : true)
            && (yearRange ? rangeRent.fields.epoque === yearRange : true)
            && (roomCount ? +roomCount < 5 ? rangeRent.fields.piece === +roomCount : rangeRent.fields.piece === 4 : true)
            && (hasFurniture != null ? hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
    })

    log.info('rent filter done')
    // Get the worst case scenario
    return rentList.length ? rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current) : null
}
