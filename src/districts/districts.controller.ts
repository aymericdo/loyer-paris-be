import express from 'express'
import { getAddresses } from './addresses'
import { getDistricts } from './districts'
const router = express.Router()

router.get('/list/:city', getDistricts)
router.get('/address/:city', getAddresses)

module.exports = router
