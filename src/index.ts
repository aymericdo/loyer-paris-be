import dotenv from 'dotenv'
import 'module-alias/register'
dotenv.config()

import { CronJobsService } from '@cronjobs/cronjobs'
import * as Sentry from '@sentry/node'
import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'

import path from 'path'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { PrettyLog } from '@services/helpers/pretty-log'
import { ApiErrorsService } from '@services/api/errors'
import { ApiError } from '@interfaces/shared'

const app = express()

app.use(cors())

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.CURRENT_ENV === 'prod' ? 'production' : 'local',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
})

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.use(
  express.json({
    limit: '5mb',
    type: ['application/json', 'text/plain'],
  })
)

app.use(
  express.urlencoded({
    limit: '5mb',
    extended: true,
    parameterLimit: 50000,
  })
)

app.use(express.static(path.resolve('./json-data')))

app.use('/seloger', require('./api/websites/seloger.controller'))
app.use('/leboncoin', require('./api/websites/leboncoin.controller'))
app.use('/pap', require('./api/websites/pap.controller'))
app.use('/logic-immo', require('./api/websites/logicimmo.controller'))
app.use('/lefigaro', require('./api/websites/lefigaro.controller'))
app.use('/orpi', require('./api/websites/orpi.controller'))
app.use('/facebook', require('./api/websites/facebook.controller'))
app.use('/gensdeconfiance', require('./api/websites/gensdeconfiance.controller'))
app.use('/bellesdemeures', require('./api/websites/bellesdemeures.controller'))
app.use('/lux-residence', require('./api/websites/lux-residence.controller'))
app.use('/bienici', require('./api/websites/bienici.controller'))
app.use('/fnaim', require('./api/websites/fnaim.controller'))
app.use('/superimmo', require('./api/websites/superimmo.controller'))
app.use('/locservice', require('./api/websites/locservice.controller'))
app.use('/foncia', require('./api/websites/foncia.controller'))
app.use('/avendrealouer', require('./api/websites/avendrealouer.controller'))

app.use('/stats', require('./api/stats.controller'))

app.use('/shop', require('./api/shop.controller'))
app.use('/simulator', require('./api/simulator.controller'))
app.use('/districts', require('./api/districts.controller'))
app.use('/cities', require('./api/cities.controller'))

app.use('/version', require('./api/version.controller'))

if (process.env.CURRENT_ENV === 'prod') {
  // Watch the cronjobs
  new CronJobsService().watch()
}

app.use(Sentry.Handlers.errorHandler())
app.use(function onError(err: ApiError | Error, req: Request, res: (Response & { sentry: string }), next: NextFunction) {
  const apiError = new ApiErrorsService(err as ApiError)
  apiError.sendSlackErrorMessage(res.sentry)

  const status = apiError.status
  if (status > 500) {
    next(err)
  } else {
    res.status(status).json(err)
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => PrettyLog.call(`Encadrement app listening on port ${port}!`, 'yellow'))
