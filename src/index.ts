import 'module-alias/register'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import * as Sentry from '@sentry/node'
const app = express()
dotenv.config()

app.use(cors())
app.use(express.json({
    limit: '1mb',
    type: ['application/json', 'text/plain'],
}))

app.use(express.urlencoded({
    limit: '1mb',
    extended: true,
    parameterLimit: 50000,
}))

app.use('/seloger', require('./websites/seloger/seloger.controller'))
app.use('/leboncoin', require('./websites/leboncoin/leboncoin.controller'))
app.use('/jinka', require('./websites/loueragile/loueragile.controller'))
app.use('/pap', require('./websites/pap/pap.controller'))
app.use('/logic-immo', require('./websites/logicimmo/logicimmo.controller'))
app.use('/lefigaro', require('./websites/lefigaro/lefigaro.controller'))
app.use('/orpi', require('./websites/orpi/orpi.controller'))
app.use('/facebook', require('./websites/facebook/facebook.controller'))
app.use('/gensdeconfiance', require('./websites/gensdeconfiance/gensdeconfiance.controller'))
app.use('/bellesdemeures', require('./websites/bellesdemeures/bellesdemeures.controller'))
app.use('/lux-residence', require('./websites/lux-residence/lux-residence.controller'))
app.use('/bienici', require('./websites/bienici/bienici.controller'))
app.use('/fnaim', require('./websites/fnaim/fnaim.controller'))
app.use('/superimmo', require('./websites/superimmo/superimmo.controller'))

app.use('/stats', require('./stats/stats.controller'))

app.use('/version', require('./version/version.controller'))

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.CURRENT_ENV === 'prod' ? 'production' : 'local',
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))