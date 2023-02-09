import { PrettyLog } from '@services/helpers/pretty-log'
import { BienIci } from '@services/websites/bienici/bienici'
import express, { Request, Response } from 'express'
import * as fs from 'fs'
const router = express.Router()

router.post('/data/v2', getByDataV2)
function getByDataV2(req: Request, res: Response) {
  PrettyLog.call(`-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`, 'blue')
  const bienici = new BienIci(res, { body: req.body })

  fs.writeFile('json-data/bite.json', req.body.data, (err) => {
    if (err) {
      console.error(err)
    }
  })
  bienici.analyse()
}

module.exports = router
