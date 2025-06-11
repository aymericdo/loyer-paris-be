import { getRelevantAds } from '@services/shop/relevant-ads'
import express from 'express'
const router = express.Router()

router.get('/', getRelevantAds)

export default router
