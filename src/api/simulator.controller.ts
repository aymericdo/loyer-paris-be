import { getManualResult } from '@services/simulator/manual-result'
import express from 'express'

const router = express.Router()

router.get('/:city', getManualResult)

module.exports = router
