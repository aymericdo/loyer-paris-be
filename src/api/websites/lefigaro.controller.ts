import { PrettyLog } from '@services/helpers/pretty-log'
import { LeFigaro } from '@services/websites/lefigaro/lefigaro'
import express, { Request, Response } from 'express'
const router = express.Router()

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  res.status(410)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  const leFigaro = new LeFigaro(res, { body: req.body })

  leFigaro.analyse()
}

module.exports = router
