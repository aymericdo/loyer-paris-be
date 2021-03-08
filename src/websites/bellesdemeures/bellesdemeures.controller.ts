import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { BellesDemeures } from './bellesdemeures';

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
    log.info(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
    const bellesdemeures = new BellesDemeures(res, { body: req.body }, true)
    bellesdemeures.analyse()
}

module.exports = router
