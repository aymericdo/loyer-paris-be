const db = require('../db')
const Rent = db.Rent
import * as log from '../helper/log.helper'
const NodeCache = require('node-cache')
const dbCache = new NodeCache({ checkperiod: 60 * 15, deleteOnExpire: true })

export async function getAll() {
    const data = dbCache.get('data')
    if (data != undefined) {
        log.info('Load cache of Rent DB')
        await data
    } else {
        log.info('Load Rent DB')
        await Rent.find({}, async (err, rents) => {
            if (err) {
                throw err
            }
            dbCache.set('data', rents)
            await rents
        })
    }
}
