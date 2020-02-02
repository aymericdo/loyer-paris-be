import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LeBonCoin } from './leboncoin'

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    const leboncoin = new LeBonCoin({ body: req.body })
    leboncoin.analyse(res)
}

module.exports = router
