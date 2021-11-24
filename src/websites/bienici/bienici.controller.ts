import express, { Request, Response } from 'express'
const router = express.Router()
import * as log from '@helpers/log'
import { BienIci } from './bienici'

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  log.info(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const bienici = new BienIci(res, { body: req.body }, true)
  bienici.analyse()
}

module.exports = router
