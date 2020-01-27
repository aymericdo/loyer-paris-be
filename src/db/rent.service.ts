const db = require('../db')
const Rent = db.Rent
import * as log from '@helpers/log'
const NodeCache = require('node-cache')
const dbCache = new NodeCache({ checkperiod: 60 * 15, deleteOnExpire: true })

export interface DataBaseItem {
    id: string
    website: string
    address?: string
    city?: string
    postalCode?: string
    longitude?: string
    latitude?: string
    hasFurniture?: boolean
    roomCount?: number
    yearBuilt?: number[]
    price?: number
    priceExcludingCharges?: number
    surface?: number
    maxPrice?: number
    isLegal?: boolean
    renter?: string
    createdAt?: string
    stations?: string[]
}

export async function getAll(): Promise<DataBaseItem[]> {
    const data = dbCache.get('data')
    if (data != undefined) {
        log.info('Load cache of Rent DB')
        return await data
    } else {
        log.info('Load Rent DB')
        await Rent.find({}, async (err: Error, rents: DataBaseItem[]) => {
            if (err) {
                throw err
            }
            dbCache.set('data', rents)
            return await rents
        })
    }
}
