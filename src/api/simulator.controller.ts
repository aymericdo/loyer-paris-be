import { paramMiddleware } from '@services/api/validations'
import { simulator } from '@services/simulator/simulator'
import express from 'express'

const router = express.Router()

router.get('/:city', paramMiddleware(), simulator)
router.get('mon-loyer/:city', paramMiddleware(), simulator)

export default router
