import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { Fnaim } from './fnaim'

router.post("/data/v2", getByDataV2);
function getByDataV2(req: Request, res: Response, next: NextFunction) {
  log.info(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const fnaim = new Fnaim(res, { body: req.body }, true)
  fnaim.analyse()
}

module.exports = router;
