import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LogicImmo } from './logicimmo'

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const logicimmo = new LogicImmo({ body: req.body })
    logicimmo.analyse(res)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
    log.info(`-> v2/${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const logicimmo = new LogicImmo({ body: req.body }, true)
    logicimmo.analyse(res)
}

module.exports = router
