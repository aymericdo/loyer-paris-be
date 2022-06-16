import { PrettyLog } from '@services/helpers/pretty-log'
import { Fnaim } from '@services/websites/fnaim/fnaim'
import express, { Request, Response } from 'express'
const router = express.Router()

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const fnaim = new Fnaim(res, { body: req.body }, true)
  fnaim.analyse()
}

module.exports = router
