import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LeFigaro } from './lefigaro'

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response, next: NextFunction) {
    log.info(`-> ${req.baseUrl}/${req.body.id} getByData`, 'blue')
    const leFigaro = new LeFigaro({ body: req.body })
    leFigaro.analyse(res)
}

module.exports = router
