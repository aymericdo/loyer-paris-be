import { PrettyLog } from '@services/helpers/pretty-log'
import { BienIci } from '@services/websites/bienici/bienici'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
async function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  const bienici = new BienIci(res, { body: req.body })

  await bienici.analyse()
}

export default router
