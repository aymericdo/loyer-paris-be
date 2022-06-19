import express, { Request, Response } from 'express'
const router = express.Router()
import { PrettyLog } from '@services/helpers/pretty-log'
import { Facebook } from '@services/websites/facebook/facebook'

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
  const facebook = new Facebook(res, { body: req.body })
  facebook.analyse()
}

module.exports = router