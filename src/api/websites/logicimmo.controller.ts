import { PrettyLog } from '@services/helpers/pretty-log'
import { LogicImmo } from '@services/websites/logicimmo/logicimmo'
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
  const logicimmo = new LogicImmo(res, { body: req.body })
  await logicimmo.analyse()
}

export default router
