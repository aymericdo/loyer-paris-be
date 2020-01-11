import express from 'express'
import { Request, Response, NextFunction } from 'express';
const app = express()
import cors from 'cors'
import * as log from './helper/log.helper'
import * as Sentry from '@sentry/node'

app.use(cors())
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.use('/', function (req: Request, res: Response, next: NextFunction) {
    const isStats = req.url.split('/') && req.url.split('/')[1] === 'stats'
    log.apiHit(isStats)
    next()
})

app.use('/seloger', require('./seloger/seloger.controller'))
app.use('/leboncoin', require('./leboncoin/leboncoin.controller'))
app.use('/loueragile', require('./loueragile/loueragile.controller'))
app.use('/pap', require('./pap/pap.controller'))
app.use('/logic-immo', require('./logicimmo/logicimmo.controller'))
app.use('/lefigaro', require('./lefigaro/lefigaro.controller'))
app.use('/orpi', require('./orpi/orpi.controller'))
app.use('/facebook', require('./facebook/facebook.controller'))

app.use('/stats', require('./stats/stats.controller'))

app.use('/migrations', require('./db/migrations.controller'))

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.PROD ? 'production' : 'local',
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))