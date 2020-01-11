const db = require('../../db')
const Rent = db.Rent

export const migration1 = () => {
    Rent.find({}, function (err, rents) {
        if (err) {
            console.log(err)
        }
        let cpt = 0
        let cpt2 = 0
        rents.forEach(function (rent) {
            cpt += 1
            if (!rent.priceExcludingCharges) {
                cpt2 += 1
                rent['priceExcludingCharges'] = rent.price
                rent.save()
            }
        });
        console.log(cpt)
        console.log(cpt2)
    });
}
