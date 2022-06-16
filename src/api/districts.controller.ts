import { getAddresses } from '@services/address/addresses'
import { getDistricts } from '@services/stats/districts'
import express from 'express'
const router = express.Router()

router.get('/list/:city', getDistricts)
router.get('/address/:city', getAddresses)

module.exports = router
