const express = require('express')
const app = express()
const cors = require('cors')
const addressService = require('./service/address.service')
const bodyParser = require('body-parser')

const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.use('/seloger', require('./seloger/seloger.controller'))

app.use('/leboncoin', require('./leboncoin/leboncoin.controller'))

app.use('/loueragile', require('./loueragile/loueragile.controller'))

// opencage api tester
app.get('/opencage', (req, res) => {
    addressService.getCoordinate(req.query.address)
        .then((info) => {
            res.json(info)
        })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))