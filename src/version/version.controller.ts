import express, { NextFunction, Request, Response } from 'express'
const router = express.Router()

router.get('/', getIsExtensionUpToDate)
function getIsExtensionUpToDate(req: Request, res: Response, next: NextFunction) {
    const currentVersion = '5.0.0'
    const version = req.query.version
    res.json(currentVersion > version)
}

module.exports = router
