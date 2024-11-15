import { PrettyLog } from '@services/helpers/pretty-log'
import { Superimmo } from '@services/websites/superimmo/superimmo'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  const superimmo = new Superimmo(res, { body: req.body })
  superimmo.analyse()
}

module.exports = router
