import { IpService } from '@services/helpers/ip'
import { PrettyLog } from '@services/helpers/pretty-log'
import { getAdoptionRate } from '@services/stats/adoption'
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
import axios from 'axios'
import express, { NextFunction, Request, Response } from 'express'
const router = express.Router()

router.get('/need-captcha', getNeedCaptcha)
function getNeedCaptcha(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getNeedCaptcha`, 'blue')
  const ipService = new IpService(req)
  res.status(200).json(!ipService.isIpCached())
}

router.use('/', function (req: Request, res: Response, next: NextFunction) {
  const ipService = new IpService(req)

  if (ipService.isIpCached()) {
    next()
  } else {
    if (!req.query.recaptchaToken) {
      return res.status(403).json({
        message: 'token expired',
      })
    }
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${req.query.recaptchaToken}`
    axios
      .post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          },
        }
      )
      .then((response) => {
        if (!response.data.success) {
          return res.status(500).json({
            message: response.data['error-codes'].join('.'),
          })
        } else {
          ipService.saveIp()
        }

        next()
      })
      .catch(() => {
        return res.status(500).json({ message: 'oops, something went wrong on our side' })
      })
  }
})

// routes
router.get('/welcome/:city', getWelcomeText)
router.get('/map/:city', getMap)
router.get('/chloropleth-map/:city', getChloroplethMap)
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
