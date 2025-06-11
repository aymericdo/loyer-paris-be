import { paramMiddleware } from '@services/api/validations'
import { getManualResult } from '@services/simulator/manual-result'
import express from 'express'

const router = express.Router()

router.get('/:city', paramMiddleware(), getManualResult)

export default router
