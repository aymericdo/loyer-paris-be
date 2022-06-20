import express, { Request, Response } from 'express'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Orpi } from '@services/websites/orpi/orpi'
const router = express.Router()
import * as fs from 'fs'

// routes
router.post('/data', getByData)
function getByData(req: Request, res: Response) {
  PrettyLog.call(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )
  res.status(410)
}

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    'blue'
  )

  const orpi = new Orpi(res, { body: req.body })
  fs.writeFile('json-data/bite.json', req.body.data, err => {
    if (err) {
      console.error(err)
    }
  })
  orpi.analyse()
}

module.exports = router
