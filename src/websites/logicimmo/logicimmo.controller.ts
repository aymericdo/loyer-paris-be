import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LogicImmo } from './logicimmo'

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    const logicimmo = new LogicImmo({ body: req.body })
    logicimmo.analyse(res)
}

module.exports = router
