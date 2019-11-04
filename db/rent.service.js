const db = require('db')
const Rent = db.Rent
const log = require('helper/log.helper')

function getAll(onSuccess, onError) {
    log.info('Load Rent DB')
    Rent.find({}, function (err, rents) {
        if (err) {
            onError(err)
        }
        var rentArray = [];

        rents.forEach(function (rent) {
            rentArray.push(rent);
        });
        onSuccess(rentArray)
    });
}

module.exports = {
    getAll,
}
