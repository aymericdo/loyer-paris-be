import { PrettyLog } from '@services/helpers/pretty-log'
import { SeLoger } from '@services/websites/seloger/seloger'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data', getByData)
function getByData(req: Request, res: Response) {
  PrettyLog.call(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue',
  )
  res.status(410).send('deprecated')
}

router.post('/data/v2', getByDataV2)
async function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue',
  )
  const seloger = new SeLoger(res, { body: req.body })
  await seloger.analyse()
}

export default router
