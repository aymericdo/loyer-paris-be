import { getAddresses } from '@services/districts/addresses'
import { getDistricts } from '@services/districts/districts'
import express from 'express'
const router = express.Router()

router.get('/list/:city', getDistricts)
router.get('/address/:city', getAddresses)

module.exports = router
