import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { Gensdeconfiance } from './gensdeconfiance'

router.post('/data', getByData)
function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const gensdeconfiance = new Gensdeconfiance({ body: req.body })
    gensdeconfiance.analyse(res)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
    const gensdeconfiance = new Gensdeconfiance({ body: req.body }, true)
    gensdeconfiance.analyse(res)
}

module.exports = router