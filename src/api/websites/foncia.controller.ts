import { PrettyLog } from '@services/helpers/pretty-log'
import { Foncia } from '@services/websites/foncia/foncia'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
async function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue',
  )
  const foncia = new Foncia(res, { body: req.body })

  await foncia.analyse()
}

export default router
