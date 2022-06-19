import express from 'express'
import { getManualResult } from '@services/simulator/manual-result'
const router = express.Router()

router.get('/:city', getManualResult)

module.exports = router
