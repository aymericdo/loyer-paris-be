import 'module-alias/register'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import * as Sentry from '@sentry/node'
const app = express()
dotenv.config()

app.use(cors())
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.use('/', function (req: Request, res: Response, next: NextFunction) {
    next()
})

app.use('/websites', require('./websites/websites.controller'))

app.use('/stats', require('./stats/stats.controller'))

app.use('/version', require('./version.controller'))

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.PROD ? 'production' : 'local',
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))