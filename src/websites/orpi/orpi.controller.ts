import express, { Request, Response } from 'express'
import * as log from '@helpers/log'
import { Orpi } from './orpi'
const router = express.Router()

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response) {
  log.info(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const orpi = new Orpi(res, { body: req.body })
  orpi.analyse()
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  log.info(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )

  const orpi = new Orpi(res, { body: req.body }, true)
  orpi.analyse()
}

module.exports = router
