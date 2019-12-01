const fs = require('fs')
const express = require('express')
const request = require('request')
const router = express.Router()
const log = require('helper/log.helper')
const groupBy = require('helper/group-by.helper')
const ip = require('helper/ip.helper')
const rentService = require('db/rent.service')
const vegaService = require('service/vega.service')

const parisGeodata = JSON.parse(fs.readFileSync('json-data/quartier_paris_geodata.json', 'utf8'))

router.use('/', function (req, res, next) {
  const verifyCaptchaOptions = {
    uri: "https://www.google.com/recaptcha/api/siteverify",
    json: true,
    form: {
      secret: process.env.CAPTCHA_SECRET,
      response: req.query.recaptchaToken
    }
  }

  if (ip.isIpCached(ip.getIp(req))) {
    next()
  } else {
    ip.saveIp(ip.getIp(req))
    request.post(verifyCaptchaOptions, (err, response, body) => {
      if (err) {
        return res.status(500).json({ message: "oops, something went wrong on our side" });
      }

      if (!body.success) {
        return res.status(500).json({ message: body["error-codes"].join(".") });
      }

      next()
    }, (err) => {
      res.status(err.status).json(err)
    })
  }

})

// routes
router.get('/map', getMap)
function getMap(req, res, next) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  rentService.getAll((data) => {
    const vegaMap = {
      ...vegaService.commonOpts(),
      layer: [
        {
          data: {
            format: { type: "json", property: "features" },
            values: parisGeodata
          },
          projection: { type: "mercator" },
          mark: {
            type: "geoshape",
            fill: "lightgray",
            stroke: "white"
          },
          encoding: {
            tooltip: { field: "properties.l_qu", type: "nominal" }
          }
        },
        {
          data: {
            values: data
          },
          transform: [
            { filter: { field: "latitude", valid: true } },
            { calculate: "datum.isLegal ? 'Oui' : 'Non'", "as": "isLegal" },
            { calculate: "datum.hasFurniture === true ? 'Oui' : (datum.hasFurniture === false ? 'Non' : 'Non renseigné')", "as": "hasFurniture" },
            { calculate: "isValid(datum.renter) ? datum.renter : 'Particulier'", "as": "renter" },
            { calculate: "isValid(datum.address) ? datum.address : 'Non renseignée'", "as": "address" },
            { calculate: "isValid(datum.postalCode) ? datum.postalCode : 'Non renseigné'", "as": "postalCode" },
            { calculate: "isValid(datum.roomCount) ? datum.roomCount : 'Non renseigné'", "as": "roomCount" },
            { calculate: "isValid(datum.surface) ? datum.surface : 'Non renseignée'", "as": "surface" },
            { calculate: "isValid(datum.yearBuilt) ? datum.yearBuilt : 'Non renseignée'", "as": "yearBuilt" },
            { calculate: "isValid(datum.price) ? datum.price : 'Non renseigné'", "as": "price" },
            { calculate: "isValid(datum.maxPrice) ? datum.maxPrice : 'Non renseigné'", "as": "maxPrice" },
          ],
          encoding: {
            longitude: {
              field: "longitude",
              type: "quantitative"
            },
            latitude: {
              field: "latitude",
              type: "quantitative"
            },
            color: {
              field: "isLegal", title: "Est légal ?", type: "nominal", scale: {
                range: ["red", "green"]
              }
            },
            tooltip: [
              { field: "address", type: "nominal", title: "Adresse" },
              { field: "renter", type: "nominal", title: "Loueur" },
              { field: "postalCode", type: "ordinal", title: "Code postal" },
              { field: "roomCount", type: "quantitative", title: "Nombre de pièce(s)" },
              { field: "surface", type: "quantitative", title: "Surface" },
              { field: "yearBuilt", type: "nominal", title: "Année de construction" },
              { field: "hasFurniture", type: "nominal", title: "Meublé" },
              { field: "price", type: "quantitative", title: "Prix affiché" },
              { field: "maxPrice", type: "quantitative", title: "Prix maximum" }
            ]
          },
          mark: {
            type: "circle",
            color: "red"
          }
        }
      ],
    }
    res.json(vegaMap)
  });
}

router.get('/price-difference', getPriceDifference)
function getPriceDifference(req, res, next) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  rentService.getAll((data) => {
    const vegaMap = {
      ...vegaService.commonOpts(),
      data: {
        values: data
      },
      mark: { type: "bar", tooltip: true },
      transform: [
        { calculate: "datum.price - datum.maxPrice", as: "priceDifference" },
        { op: "count", field: "postalCode", as: "adNumber" }
      ],
      encoding: {
        x: {
          aggregate: "mean",
          field: "priceDifference",
          type: "quantitative",
          title: "Différence de prix moyenne",
        },
        y: {
          field: "postalCode",
          type: "ordinal",
          title: "Code postal",
        },
        tooltip: [
          { field: "priceDifference", type: "quantitative", title: "Différence de prix moyenne" },
          { field: "postalCode", type: "ordinal", title: "Code postal" },
          { field: "adNumber", type: "quantitative", title: "Nombre d'annonces" },
        ]
      }
    }

    res.json(vegaMap)
  });
}

router.get('/is-legal-per-surface', getLegalPerSurface)
function getLegalPerSurface(req, res, next) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  rentService.getAll((data) => {
    const vegaMap = {
      ...vegaService.commonOpts(),
      data: {
        values: data
      },
      mark: { type: "bar", tooltip: true },
      transform: [
        { calculate: "datum.isLegal ? 'Oui' : 'Non'", "as": "isLegal" },
      ],
      encoding: {
        x: {
          bin: {
            step: 5
          },
          field: "surface",
          title: "Surface",
          type: "quantitative"
        },
        y: {
          aggregate: "count",
          field: "isLegal",
          title: "Annonces",
          type: "quantitative",
        },
        color: {
          field: "isLegal",
          title: "Est légal ?",
          type: "nominal",
          scale: {
            range: ["red", "green"],
          },
        }
      }
    }

    res.json(vegaMap)
  });
}

router.get('/welcome', getWelcomeText)
function getWelcomeText(req, res, next) {
  log.info(`-> ${req.baseUrl} getWelcomeText`, 'blue')

  rentService.getAll((rents) => {
    let isLegalPercentage = Math.round(100 * rents.filter(rent => rent.isLegal).length / rents.length)
    let postalCodeGroupedRents = groupBy(rents, "postalCode")
    let extremePostalCode = getExtremePostalCode(postalCodeGroupedRents);
    let worstPostalCode = extremePostalCode[0];
    let bestPostalCode = extremePostalCode[1];

    return res.json({
      numberRents: rents.length,
      isLegalPercentage: isLegalPercentage,
      worstPostalCode: worstPostalCode,
      bestPostalCode: bestPostalCode,
    });
  });
}

function getExtremePostalCode(groupedRents) {
  var worstPc = ""
  var bestPc = ""
  var bestLegal = 0
  var worstLegal = 1

  Object.keys(groupedRents).forEach(pc => {
    let pcRents = groupedRents[pc]
    let legals = pcRents.filter(rent => rent.isLegal).length
    if (bestLegal < legals) {
      bestPc = pc
      bestLegal = legals
    }

    if (worstLegal > legals) {
      worstPc = pc
      worstLegal = legals
    }
  })
  var worstNeighborhood = (worstPc.slice(-2)[0] === '0' ? worstPc.slice(-1) : worstPc.slice(-2))
  var bestNeighborhood = (bestPc.slice(-2)[0] === '0' ? bestPc.slice(-1) : bestPc.slice(-2))
  return [worstNeighborhood, bestNeighborhood]
}



module.exports = router;