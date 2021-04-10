import express from 'express'
import { getDistricts } from './districts'
const router = express.Router()

router.get('/list/:city', getDistricts)

module.exports = router
