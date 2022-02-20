import express, { Request, Response } from 'express'
const router = express.Router()
import { PrettyLog } from '@services/pretty-log'
import { LouerAgile } from './loueragile'

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response) {
  PrettyLog.call(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )

  const loueragile = new LouerAgile(res, {
    body: req.body,
    id: req.body.id as string,
  })
  loueragile.analyse()
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  const loueragile = new LouerAgile(
    res,
    { body: req.body, id: req.body.id as string },
    true
  )
  loueragile.analyse()
}

module.exports = router
