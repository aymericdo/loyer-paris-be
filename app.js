require('rootpath')()
const express = require('express')
const app = express()
const cors = require('cors')
const log = require('helper/log.helper')
// const addressService = require('service/address.service')
const Sentry = require('@sentry/node');

app.use(cors())
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.use('/', function (req, res, next) {
    log.apiHit()
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

// opencage api tester
// app.get('/opencage', (req, res) => {
//     addressService.getCoordinate(req.query.address)
//         .then((info) => {
//             res.json(info)
//         })
// })

// address api tester
// app.get('/address', (req, res) => {
//     res.json(addressService.getAddressInParis(req.query.address, { postalCode: '75018' }))
// })

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))