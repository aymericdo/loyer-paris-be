import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LouerAgile } from './loueragile'

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')

    const loueragile = new LouerAgile({ body: req.body, id: req.body.id as string })
    loueragile.analyse(res)
}

module.exports = router
