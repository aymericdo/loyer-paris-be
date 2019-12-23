const db = require('db')
const Rent = db.Rent
const log = require('helper/log.helper')
const NodeCache = require('node-cache')
const dbCache = new NodeCache({ checkperiod: 60 * 15, deleteOnExpire: true })

function getAll(onSuccess, onError) {
    var data = dbCache.get('data')
    if (data != undefined) {
        log.info('Load cache of Rent DB')
        onSuccess(data)
    } else {
        log.info('Load Rent DB')
        Rent.find({}, function (err, rents) {
            if (err) {
                onError(err)
            }
            success = dbCache.set('data', rents)
            onSuccess(rents)
        });
    }
}

module.exports = {
    getAll,
}