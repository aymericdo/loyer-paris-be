import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/', getIsExtensionUpToDate)
function getIsExtensionUpToDate(req: Request, res: Response) {
  const currentVersion = '6.1.1'
  const version = req.query.version
  res.json(currentVersion > version)
}

module.exports = router
