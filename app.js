const express = require('express')
const app = express()
const cors = require('cors');
const addressService = require('./service/address.service');

const port = 3000

app.use(cors());

app.use('/seloger', require('./seloger/seloger.controller'));

// opencage api tester
app.get('/opencage', (req, res) => {
    addressService.getCoordinate(req.query.address)
        .then((info) => {
            res.json(info)
        })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))