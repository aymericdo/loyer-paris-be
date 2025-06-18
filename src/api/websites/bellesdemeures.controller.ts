import { PrettyLog } from '@services/helpers/pretty-log'
import { BellesDemeures } from '@services/websites/bellesdemeures/bellesdemeures'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
async function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue',
  )
  const bellesdemeures = new BellesDemeures(res, { body: req.body })
  await bellesdemeures.analyse()
}

export default router
