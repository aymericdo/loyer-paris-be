import { PrettyLog } from '@services/helpers/pretty-log'
import { LuxResidence } from '@services/websites/lux-residence/lux-residence'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  const luxresidence = new LuxResidence(res, { body: req.body })
  luxresidence.analyse()
}

module.exports = router
