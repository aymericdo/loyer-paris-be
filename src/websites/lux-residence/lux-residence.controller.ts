import express, { Request, Response } from 'express'
const router = express.Router()
import { PrettyLog } from '@services/pretty-log'
import { LuxResidence } from './lux-residence'

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const luxresidence = new LuxResidence(res, { body: req.body }, true)
  luxresidence.analyse()
}

module.exports = router
