import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LouerAgile } from './loueragile'

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')

    const loueragile = new LouerAgile({ body: req.body, id: req.body.id as string })
    loueragile.analyse(res)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
    log.info(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const loueragile = new LouerAgile({ body: req.body, id: req.body.id as string }, true)
    loueragile.analyse(res)
}

module.exports = router
