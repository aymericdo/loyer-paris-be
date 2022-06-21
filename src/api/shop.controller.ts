import express from 'express'
import { getRelevantAds } from '@services/shop/relevant-ads'
const router = express.Router()

router.get('/', getRelevantAds)

module.exports = router
