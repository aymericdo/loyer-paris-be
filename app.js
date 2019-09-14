const express = require('express')
const request = require('request')
const xmlParser = require('xml2json');
const app = express()
const cors = require('cors');

const port = 3000

app.use(cors());

app.get('/yolo', (req, res) => {
    request({
        url: `https://ws-seloger.svc.groupe-seloger.com/annonceDetail.xml?idAnnonce=${req.query.id}`,
    }, (error, response, body) => {
        res.json(JSON.parse(xmlParser.toJson(body)))
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))