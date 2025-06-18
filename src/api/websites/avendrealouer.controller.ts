import { PrettyLog } from '@services/helpers/pretty-log'
import { Avendrealouer } from '@services/websites/avendrealouer/avendrealouer'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
async function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue',
  )
  const avendrealouer = new Avendrealouer(res, { body: req.body })

  await avendrealouer.analyse()
}

export default router
