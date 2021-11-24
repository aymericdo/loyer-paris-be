import express, { Request, Response } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { LeBonCoin } from './leboncoin'

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response) {
  log.info(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const leboncoin = new LeBonCoin(res, { body: req.body })
  leboncoin.analyse()
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  log.info(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const leboncoin = new LeBonCoin(res, { body: req.body }, true)
  leboncoin.analyse()
}

module.exports = router
