const db = require('db')
const Rent = db.Rent
const log = require('helper/log.helper')

function rent(callback) {
    log.info('Load Rent DB')
    Rent.find({}, function (err, rents) {
        if (err) {
            console.error(err)
        }
        var rentArray = [];

        rents.forEach(function (rent) {
            rentArray.push(rent);
        });
        return callback(rentArray)
    });
}

module.exports = {
    rent,
}
