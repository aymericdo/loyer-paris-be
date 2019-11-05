const db = require('db')
const Rent = db.Rent
const log = require('helper/log.helper')

function rent() {
    log.info('Rent loader start')
    Rent.find({}, function (err, rents) {
        if (err) {
            console.log(err)
        }
        var rentMap = {};

        rents.forEach(function (rent) {
            rentMap[rent._id] = rent;
        });
        console.log(rentMap)
        res.send(rentMap);
    });

}

module.exports = {
    rent,
}
