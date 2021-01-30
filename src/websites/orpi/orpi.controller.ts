import express, { Request, Response, NextFunction } from 'express'
import * as log from '@helpers/log'
import { Orpi } from './orpi'
const router = express.Router()

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const orpi = new Orpi({ body: req.body })
    orpi.analyse(res)
}

module.exports = router
