import { PrettyLog } from '@services/helpers/pretty-log'
import { Locservice } from '@services/websites/locservice/locservice'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
async function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')

  const locservice = new Locservice(res, { body: req.body })
  locservice.analyse()
}

export default router
