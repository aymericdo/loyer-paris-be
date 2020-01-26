import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
// import { migration1 } from './migrations/1'

// routes
router.post('/', runMigrations)

function runMigrations(req: Request, res: Response, next: NextFunction) {
    // migration1()
    res.json('done')
}

module.exports = router
