import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { SeLoger } from './seloger'

router.post('/data', getByData)
function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const seloger = new SeLoger({ body: req.body })
    seloger.analyse(res)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
    const seloger = new SeLoger({ body: req.body }, true)
    seloger.analyse(res)
}

module.exports = router
