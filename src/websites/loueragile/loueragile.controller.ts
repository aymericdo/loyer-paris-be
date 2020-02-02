import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LouerAgile } from './loueragile'

// routes
router.get('/', getById)
async function getById(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.query.id} getById`, 'blue')
    const loueragile = new LouerAgile({ id: req.query.id })
    console.log('tamere1')
    const truc = await loueragile.fetching()
    console.log(truc)
    console.log('tamere')
    loueragile.analyse(res)
}

module.exports = router
