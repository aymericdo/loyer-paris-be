import express, { Request, Response } from 'express'
const router = express.Router()
import { PrettyLog } from '@services/helpers/pretty-log'
import { Locservice } from '@services/websites/locservice/locservice'

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  res.status(410)
}

module.exports = router
