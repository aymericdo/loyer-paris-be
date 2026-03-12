import { paramMiddleware } from '@services/api/validations'
import { monLoyer } from '@services/simulator/mon-loyer'
import { simulator } from '@services/simulator/simulator'
import express from 'express'

const router = express.Router()

router.get('/:city', paramMiddleware(), simulator)
router.get('mon-loyer/:city', paramMiddleware(), monLoyer)

export default router
