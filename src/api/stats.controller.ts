import { PrettyLog } from '@services/helpers/pretty-log'
import { getAdoptionRate } from '@services/stats/adoption'
import { getChloroplethCitiesMap } from '@services/stats/chloropleth-cities-map'
import { getChloroplethMap } from '@services/stats/chloropleth-map'
import { getIsLegalVariation } from '@services/stats/is-legal-variation'
import { getLegalPerClassicRenter } from '@services/stats/legal-per-classic-renter'
import { getLegalPerDPE } from '@services/stats/legal-per-dpe'
import { getLegalPerRenter } from '@services/stats/legal-per-renter'
import { getLegalPerSurface } from '@services/stats/legal-per-surface'
import { getLegalPerWebsite } from '@services/stats/legal-per-website'
import { getMap } from '@services/stats/map'
import { getPriceDifference } from '@services/stats/price-difference'
import { getPriceVariation } from '@services/stats/price-variation'
import { getWelcomeText } from '@services/stats/welcome-text'
import express, { NextFunction, Request, Response } from 'express'
const router = express.Router()

router.get('/need-captcha', getNeedCaptcha)
function getNeedCaptcha(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getNeedCaptcha`, 'blue')
  res.status(200).json(false)
}

router.use('/', function (req: Request, res: Response, next: NextFunction) {
  next()
})

// routes
router.get('/welcome/:city', getWelcomeText)
router.get('/map/:city', getMap)
router.get('/chloropleth-map/:city', getChloroplethMap)
router.get('/chloropleth-cities-map/:city', getChloroplethCitiesMap)
router.get('/price-difference/:city', getPriceDifference)
router.get('/is-legal-per-surface/:city', getLegalPerSurface)
router.get('/adoption', getAdoptionRate)
router.get('/price-variation/:city', getPriceVariation)
router.get('/is-legal-variation/:city', getIsLegalVariation)
router.get('/is-legal-per-renter/:city', getLegalPerRenter)
router.get('/is-legal-per-classic-renter/:city', getLegalPerClassicRenter)
router.get('/is-legal-per-website/:city', getLegalPerWebsite)
router.get('/is-legal-per-dpe/:city', getLegalPerDPE)

module.exports = router
