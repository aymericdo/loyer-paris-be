import express, { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { PrettyLog } from '@services/pretty-log';
import { IpService } from '@services/ip';
import { getMap } from './map';
import { getChloroplethMap } from './chloropleth-map';
import { getPriceDifference } from './price-difference';
import { getLegalPerSurface } from './legal-per-surface';
import { getAdoptionRate } from './adoption';
import { getPriceVariation } from './price-variation';
import { getIsLegalVariation } from './is-legal-variation';
import { getLegalPerRenter } from './legal-per-renter';
import { getLegalPerWebsite } from './legal-per-website';
import { getDistricts } from './districts';
import { getWelcomeText } from './welcome-text';
import { getLegalPerClassicRenter } from './legal-per-classic-renter';
const router = express.Router()

router.get('/need-captcha', getNeedCaptcha)
function getNeedCaptcha(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getNeedCaptcha`, 'blue');
  const ipService = new IpService(req)
  res.status(200).json(!ipService.isIpCached())
}

router.get('/district-list/:city', getDistricts)

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
        return res
          .status(500)
          .json({ message: 'oops, something went wrong on our side' })
      });
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

module.exports = router
