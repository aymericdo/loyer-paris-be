import 'module-alias/register'
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { IpFilter } from 'express-ipfilter'
import cors from 'cors'
import * as Sentry from '@sentry/node'
import { CronJobsService } from '@cronjobs/cronjobs'

const app = express()

app.use(cors())
app.use(
  express.json({
    limit: '1mb',
    type: ['application/json', 'text/plain'],
  })
)

app.use(
  express.urlencoded({
    limit: '1mb',
    extended: true,
    parameterLimit: 50000,
  })
)

// Blacklist the following IPs
const ips = ['109.11.33.58']
app.use(IpFilter(ips, { mode: 'deny' }))

app.use('/seloger', require('./websites/seloger/seloger.controller'))
app.use('/leboncoin', require('./websites/leboncoin/leboncoin.controller'))
app.use('/jinka', require('./websites/loueragile/loueragile.controller'))
app.use('/pap', require('./websites/pap/pap.controller'))
app.use('/logic-immo', require('./websites/logicimmo/logicimmo.controller'))
app.use('/lefigaro', require('./websites/lefigaro/lefigaro.controller'))
app.use('/orpi', require('./websites/orpi/orpi.controller'))
app.use('/facebook', require('./websites/facebook/facebook.controller'))
app.use(
  '/gensdeconfiance',
  require('./websites/gensdeconfiance/gensdeconfiance.controller')
)
app.use(
  '/bellesdemeures',
  require('./websites/bellesdemeures/bellesdemeures.controller')
)
app.use(
  '/lux-residence',
  require('./websites/lux-residence/lux-residence.controller')
)
app.use('/bienici', require('./websites/bienici/bienici.controller'))
app.use('/fnaim', require('./websites/fnaim/fnaim.controller'))
app.use('/superimmo', require('./websites/superimmo/superimmo.controller'))
app.use('/locservice', require('./websites/locservice/locservice.controller'))

app.use('/stats', require('./stats/stats.controller'))

app.use('/shop', require('./shop/shop.controller'))
app.use('/simulator', require('./simulator/simulator.controller'))
app.use('/districts', require('./districts/districts.controller'))

app.use('/version', require('./version/version.controller'))

if (process.env.CURRENT_ENV === 'prod') {
  // Watch the cronjobs
  new CronJobsService.watch()
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.CURRENT_ENV === 'prod' ? 'production' : 'local',
})

const port = process.env.PORT || 3000
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
