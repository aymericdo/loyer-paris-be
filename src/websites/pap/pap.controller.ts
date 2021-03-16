import express, { Request, Response, NextFunction } from 'express'
import * as log from '@helpers/log'
import { Pap } from './pap'
const router = express.Router()

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response, next: NextFunction) {
  log.info(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const pap = new Pap(res, { body: req.body })
  pap.analyse()
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response, next: NextFunction) {
  log.info(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const pap = new Pap(res, { body: req.body }, true)
  pap.analyse()
}

module.exports = router
