const express = require('express')
const request = require('request')
const xmlParser = require('xml2json');
const app = express()
const cors = require('cors');
const fs = require('fs');
const inside = require('point-in-polygon');
const opencage = require('opencage-api-client');

const port = 3000

app.use(cors());

app.get('/seloger', (req, res) => {
    request({
        url: `https://ws-seloger.svc.groupe-seloger.com/annonceDetail.xml?idAnnonce=${req.query.id}`,
    }, (error, response, body) => {
        const parisDistricts = JSON.parse(fs.readFileSync('quartier_paris.json', 'utf8'));
        const encadrements = JSON.parse(fs.readFileSync('encadrements.json', 'utf8'));
        const ad = JSON.parse(xmlParser.toJson(body)).detailAnnonce

        getCoordinate(ad.adresse)
            .then((info) => {
                const district = parisDistricts.find(district => inside([info.geometry.lng, info.geometry.lat], district.fields.geom.coordinates[0]))
                const yearBuilt = ad.details.detail.find(detail => detail.libelle === "Année de construction").valeur
                const roomCount = +ad.nbPieces
                const rent = encadrements.filter((encadrement) => {
                    const yearBuiltRange = encadrement.fields.epoque
                        .split(/[\s-]+/)
                        .map(year => isNaN(year) ? year.toLowerCase() : +year)

                    let isInRange = (typeof yearBuiltRange[0] === 'number') ?
                        yearBuiltRange[0] < yearBuilt && yearBuiltRange[1] > yearBuilt
                    : (yearBuiltRange[0] === 'avant') ?
                        yearBuilt < yearBuiltRange[1]
                    : (yearBuiltRange[0] === 'apres') ?
                        yearBuilt > yearBuiltRange[1]
                    :
                        false
                            
                    return encadrement.fields.id_quartier === district.fields.c_qu 
                        && isInRange
                        && encadrement.fields.piece === roomCount
                })
                // res.json(ad)
                // res.json(district)
                console.log(rent.length)
                res.json(rent)
            })
    })
})

function getCoordinate(address) {
    return opencage.geocode({ q: address }).then(data => {
        if (data.status.code == 200) {
            if (data.results.length > 0) {
                const place = data.results[0]
                return place
            }
        } else if (data.status.code == 402) {
            console.log('hit free-trial daily limit')
            console.log('become a customer: https://opencagedata.com/pricing')
        } else {
            // other possible response codes:
            // https://opencagedata.com/api#codes
            console.log('error', data.status.message)
        }
    }).catch(error => {
        console.log('error', error.message)
    });
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))