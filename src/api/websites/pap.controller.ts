import express, { Request, Response } from 'express'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Pap } from '@services/websites/pap/pap'
const router = express.Router()

// routes
router.post('/data', getByData)

function getByData(req: Request, res: Response) {
  PrettyLog.call(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  res.status(410)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const pap = new Pap(res, { body: req.body })
  pap.analyse()
}

module.exports = router
