import { PrettyLog } from '@services/helpers/pretty-log'
import { LeBonCoin } from '@services/websites/leboncoin/leboncoin'
import express, { Request, Response } from 'express'
const router = express.Router()

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  res.status(410).send('deprecated')
}

router.post('/data/v2', getByDataV2)
async function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  const leboncoin = new LeBonCoin(res, { body: req.body })
  await leboncoin.analyse()
}

export default router
