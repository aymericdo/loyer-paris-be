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
import { getMapFrance } from '@services/stats/map-france'
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
router.get(
  '/welcome/:city',
  paramMiddleware({ allAccepted: true }),
  getWelcomeText,
)
router.get('/map/france', getMapFrance)
router.get('/map/:city', paramMiddleware({ allAccepted: true }), getMap)
router.get(
  '/chloropleth-map/:city',
  paramMiddleware({ allAccepted: true }),
  getChloroplethMap,
)
router.get(
  '/chloropleth-cities-map/:city',
  paramMiddleware({ allAccepted: true }),
  getChloroplethCitiesMap,
)
router.get(
  '/price-difference/:city',
  paramMiddleware({ allAccepted: true }),
  getPriceDifference,
)
router.get(
  '/is-legal-per-surface/:city',
  paramMiddleware({ allAccepted: true }),
  getLegalPerSurface,
)
router.get(
  '/price-variation/:city',
  paramMiddleware({ allAccepted: true }),
  getPriceVariation,
)
router.get(
  '/is-legal-variation/:city',
  paramMiddleware({ allAccepted: true }),
  getIsLegalVariation,
)
router.get(
  '/is-legal-per-renter/:city',
  paramMiddleware({ allAccepted: true }),
  getLegalPerRenter,
)
router.get(
  '/is-legal-per-classic-renter/:city',
  paramMiddleware({ allAccepted: true }),
  getLegalPerClassicRenter,
)
router.get(
  '/is-legal-per-website/:city',
  paramMiddleware({ allAccepted: true }),
  getLegalPerWebsite,
)
router.get(
  '/is-legal-per-dpe/:city',
  paramMiddleware({ allAccepted: true }),
  getLegalPerDPE,
)

export default router
