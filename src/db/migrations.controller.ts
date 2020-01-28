import express, { Request, Response, NextFunction } from 'express'
import { Rent } from './../db'
import { DataBaseItem } from '@interfaces/shared'
const router = express.Router()

// routes
router.post('/', runMigrations)

function runMigrations(req: Request, res: Response, next: NextFunction) {
    Rent.find({}, function (err: Error, rents: DataBaseItem[]) {
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
        })
        console.log(cpt)
        console.log(cpt2)
    })

    res.json('done')
}

module.exports = router
