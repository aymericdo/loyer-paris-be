import * as fs from 'fs'
import * as path from 'path'
import * as yearBuiltService from '../service/year-built.service'
import * as log from '../helper/log.helper'
import * as addressService from '../service/address.service'
import { DetectedInfo, EncadrementItem } from './interfaces';

let rangeRents: EncadrementItem[] = null
fs.readFile(path.join(__dirname, '../json-data/encadrements.json'), 'utf8', (error, data) => {
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
