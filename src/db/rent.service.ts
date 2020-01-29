import { Rent } from './db'
import { DataBaseItem } from '@interfaces/shared'
import * as log from '@helpers/log'
const NodeCache = require('node-cache')
const dbCache = new NodeCache({ checkperiod: 60 * 15, deleteOnExpire: true })

export async function getAll(): Promise<DataBaseItem[]> {
    const data = dbCache.get('data')
    if (data != undefined) {
        log.info('Load cache of Rent DB')
        return await data
    } else {
        log.info('Load Rent DB')
        return await Rent.find({}, (err: Error, rents: DataBaseItem[]) => {
            if (err) {
                throw err
            }
            dbCache.set('data', rents)
            return rents
        })
    }
}
