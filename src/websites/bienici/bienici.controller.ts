import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { BienIci } from './bienici';

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
    log.info(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const bienici = new BienIci({ body: req.body }, true)
    bienici.analyse(res)
}

module.exports = router
