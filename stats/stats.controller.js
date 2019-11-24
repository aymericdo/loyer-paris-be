const fs = require('fs')
const express = require('express')
const request = require('request')
const router = express.Router()
const log = require('helper/log.helper')
const rentService = require('db/rent.service')
const vegaService = require('service/vega.service')

const parisGeodata = JSON.parse(fs.readFileSync('json-data/quartier_paris_geodata.json', 'utf8'))

// routes
router.get('/map', getMap)
function getMap(req, res, next) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  const verifyCaptchaOptions = {
    uri: "https://www.google.com/recaptcha/api/siteverify",
    json: true,
    form: {
      secret: process.env.CAPTCHA_SECRET,
      response: req.query.recaptchaToken
    }
  };


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

router.get('/priceDifference', getPriceDifference)
function getPriceDifference(req, res, next) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  const verifyCaptchaOptions = {
    uri: "https://www.google.com/recaptcha/api/siteverify",
    json: true,
    form: {
      secret: process.env.CAPTCHA_SECRET,
      response: req.query.recaptchaToken
    }
  };

  request.post(verifyCaptchaOptions, (err, response, body) => {
    if (err) {
      return res.status(500).json({ message: "oops, something went wrong on our side" });
    }

    if (!body.success) {
      return res.status(500).json({ message: body["error-codes"].join(".") });
    }

    rentService.getAll((data) => {
      const vegaMap = {
        ...vegaService.commonOpts,
        "autosize": {
          "type": "fit",
          "contains": "padding"
        },
        "data": {
          "values": data
        },
        "mark": { "type": "bar", "tooltip": true },
        "transform": [
          { "calculate": "datum.price - datum.maxPrice", "as": "priceDifference" }
        ],
        "encoding": {
          "x": {
            "aggregate": "mean",
            "field": "priceDifference",
            "type": "quantitative",
            "title": "Différence de prix moyen"
          },
          "y": {
            "field": "postalCode",
            "type": "ordinal",
            "title": "Code postal"
          }
        }
      }

      res.json(vegaMap)
    });
  }, (err) => {
    res.status(err.status).json(err)
  })
}

router.get('/islegalpersurface', getLegalPerSurface)
function getLegalPerSurface(req, res, next) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  const verifyCaptchaOptions = {
    uri: "https://www.google.com/recaptcha/api/siteverify",
    json: true,
    form: {
      secret: process.env.CAPTCHA_SECRET,
      response: req.query.recaptchaToken
    }
  };

  request.post(verifyCaptchaOptions, (err, response, body) => {
    if (err) {
      return res.status(500).json({ message: "oops, something went wrong on our side" });
    }

    if (!body.success) {
      return res.status(500).json({ message: body["error-codes"].join(".") });
    }

    rentService.getAll((data) => {
      const vegaMap = {
        ...vegaService.commonOpts(),
        "data": {
          "values": data
        },
        "mark": { "type": "bar", "tooltip": true },
        "encoding": {
          "x": {
            "bin": {
              "step": 5
            },
            "field": "surface",
            "title": "Surface",
            "type": "quantitative"
          },
          "y": {
            "aggregate": "count",
            "field": "isLegal",
            "title": "Est légal ?",
            "type": "quantitative"
          },
          "color": {
            "field": "isLegal",
            "type": "nominal",
            "scale": {
              "range": ["red", "green"]
            }
          }
        }
      }

      res.json(vegaMap)
    });
  }, (err) => {
    res.status(err.status).json(err)
  })
}


router.get('/welcome', getWelcomeText)
function getWelcomeText(req, res, next) {
  log.info(`-> ${req.baseUrl} getWelcomeText`, 'blue')

  rentService.getAll((rents) => {
    let numberRents = rents.length
    let isLegalPercentage = Math.round(100 * rents.map(rent => rent.isLegal).reduce((acc, x) => acc + x, 0) / rents.length)
    let postalCodeGroupedRents = getMapGroupBy(rents, "postalCode")
    let bestPostalCode = getExtremePostalCode(postalCodeGroupedRents, "best")
    let worstPostalCode = getExtremePostalCode(postalCodeGroupedRents, "worst")
    return res.json({ message: `Sur les ${numberRents} annonces étudiées, seulement ${isLegalPercentage}% sont légales. Le ${bestPostalCode}e est l'arrondissement où l'encadrement est le plus respecté contrairement au ${worstPostalCode}e qui à le plus d'annonces illégales.` });
  });
}

var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function getMapGroupBy(xs, key) {
  let grouped_rents = groupBy(xs, key)
  var groupedMap = new Map();
  for (const [key, grouped_r] of Object.entries(grouped_rents)) {
    groupedMap.set(key, grouped_r);
  }
  return groupedMap
}

function getExtremePostalCode(grouped_map, comparison) {
  var extremePc = ""
  var extremeLegal = 0 ? comparison == "best" : 1
  for (var [pc, grouped_r] of grouped_map) {
    let legals = grouped_r.map(rent => rent.isLegal).reduce((acc, x) => acc + x, 0)
    if ((comparison == "best" && extremeLegal < legals) || (comparison == "worst" && extremeLegal > legals)) {
      extremePc = pc;
      extremeLegal = legals
    }
  }
  return (extremePc.slice(-2)[0] === '0' ? extremePc.slice(-1) : extremePc.slice(-2))
}



module.exports = router;