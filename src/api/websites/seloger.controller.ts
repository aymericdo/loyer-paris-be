import express, { Request, Response } from 'express'
const router = express.Router()
import { PrettyLog } from '@services/helpers/pretty-log'
import { SeLoger } from '@services/websites/seloger/seloger'
import * as fs from 'fs'

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
  const seloger = new SeLoger(res, { body: req.body })
  fs.writeFile('json-data/bite.json', req.body.data, err => {
    if (err) {
      console.error(err)
    }
  })
  seloger.analyse()
}

module.exports = router
