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

import selogerController from '@api/websites/seloger.controller'
import leboncoinController from '@api/websites/leboncoin.controller'
import papController from '@api/websites/pap.controller'
import logicimmoController from '@api/websites/logicimmo.controller'
import lefigaroController from '@api/websites/lefigaro.controller'
import orpiController from '@api/websites/orpi.controller'
import facebookController from '@api/websites/facebook.controller'
import gensdeconfianceController from '@api/websites/gensdeconfiance.controller'
import bellesdemeuresController from '@api/websites/bellesdemeures.controller'
import luxResidenceController from '@api/websites/lux-residence.controller'
import bieniciController from '@api/websites/bienici.controller'
import fnaimController from '@api/websites/fnaim.controller'
import superimmoController from '@api/websites/superimmo.controller'
import locserviceController from '@api/websites/locservice.controller'
import fonciaController from '@api/websites/foncia.controller'
import avendrealouerController from '@api/websites/avendrealouer.controller'

import statsController from '@api/stats.controller'
import shopController from '@api/shop.controller'
import simulatorController from '@api/simulator.controller'
import districtsController from '@api/districts.controller'
import citiesController from '@api/cities.controller'
import versionController from '@api/version.controller'

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

app.use('/seloger', selogerController)
app.use('/leboncoin', leboncoinController)
app.use('/pap', papController)
app.use('/logic-immo', logicimmoController)
app.use('/lefigaro', lefigaroController)
app.use('/orpi', orpiController)
app.use('/facebook', facebookController)
app.use('/gensdeconfiance', gensdeconfianceController)
app.use('/bellesdemeures', bellesdemeuresController)
app.use('/lux-residence', luxResidenceController)
app.use('/bienici', bieniciController)
app.use('/fnaim', fnaimController)
app.use('/superimmo', superimmoController)
app.use('/locservice', locserviceController)
app.use('/foncia', fonciaController)
app.use('/avendrealouer', avendrealouerController)

app.use('/stats', statsController)

app.use('/shop', shopController)
app.use('/simulator', simulatorController)
app.use('/districts', districtsController)
app.use('/cities', citiesController)

app.use('/version', versionController)

if (process.env.CURRENT_ENV === 'prod') {
  // Watch the cronjobs
  new CronJobsService().watch()
}

app.use(Sentry.Handlers.errorHandler())
app.use(function onError(err: ApiError | Error, req: Request, res: (Response & { sentry: string }), next: NextFunction) {
  const apiError = new ApiErrorsService(err as ApiError)
  apiError.sendSlackErrorMessage(res.sentry)

  const status = apiError.status
  if (status >= 500) {
    next(err)
  } else {
    res.status(status).json(err)
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => PrettyLog.call(`Encadrement app listening on port ${port}!`, 'yellow'))
