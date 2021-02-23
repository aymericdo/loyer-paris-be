import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { Facebook } from './facebook'

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const facebook = new Facebook({ body: req.body })
    facebook.analyse(res)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
    log.info(`-> v2/${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const facebook = new Facebook({ body: req.body }, true)
    facebook.analyse(res)
}

module.exports = router
