import { paramMiddleware } from '@services/api/validations'
import { PrettyLog } from '@services/helpers/pretty-log'
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
import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/need-captcha', getNeedCaptcha)
function getNeedCaptcha(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getNeedCaptcha`, 'blue')
  res.status(200).json(false)
}

// routes
router.get('/welcome/:city', paramMiddleware(true), getWelcomeText)
router.get('/map/:city', paramMiddleware(true), getMap)
router.get('/chloropleth-map/:city', paramMiddleware(true), getChloroplethMap)
router.get(
  '/chloropleth-cities-map/:city',
  paramMiddleware(true),
  getChloroplethCitiesMap,
)
router.get('/price-difference/:city', paramMiddleware(true), getPriceDifference)
router.get(
  '/is-legal-per-surface/:city',
  paramMiddleware(true),
  getLegalPerSurface,
)
router.get('/price-variation/:city', paramMiddleware(true), getPriceVariation)
router.get(
  '/is-legal-variation/:city',
  paramMiddleware(true),
  getIsLegalVariation,
)
router.get(
  '/is-legal-per-renter/:city',
  paramMiddleware(true),
  getLegalPerRenter,
)
router.get(
  '/is-legal-per-classic-renter/:city',
  paramMiddleware(true),
  getLegalPerClassicRenter,
)
router.get(
  '/is-legal-per-website/:city',
  paramMiddleware(true),
  getLegalPerWebsite,
)
router.get('/is-legal-per-dpe/:city', paramMiddleware(true), getLegalPerDPE)

export default router
