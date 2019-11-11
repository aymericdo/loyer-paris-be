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

  request.post(verifyCaptchaOptions, (err, response, body) => {
    if (err) {
      return res.status(500).json({ message: "oops, something went wrong on our side" });
    }

    if (!body.success) {
      return res.status(500).json({ message: body["error-codes"].join(".") });
    }

    rentService.getAll((data) => {
      const vegaMap = {
        ...vegaService.commonOpts("Carte encadrement des loyers à Paris"),
        "layer": [
          {
            "data": {
              "format": { "type": "json", "property": "features" },
              "values": parisGeodata
            },
            "projection": { "type": "mercator" },
            "mark": {
              "type": "geoshape",
              "fill": "lightgray",
              "stroke": "white"
            },
            "encoding": {
              "tooltip": { "field": "properties.l_qu", "type": "nominal" }
            }
          },
          {
            "data": {
              "values": data
            },
            "transform": [
              { "filter": { "field": "latitude", "valid": true } },
              { "calculate": "datum.isLegal ? 'Oui' : 'Non'", "as": "isLegal" },
              { "calculate": "datum.hasFurniture === true ? 'Oui' : (datum.hasFurniture === false ? 'Non' : 'undefined')", "as": "hasFurniture" },
              { "calculate": "datum.renter ? datum.renter : 'Particulier'", "as": "renter" },
            ],
            "encoding": {
              "longitude": {
                "field": "longitude",
                "type": "quantitative"
              },
              "latitude": {
                "field": "latitude",
                "type": "quantitative"
              },
              "color": {
                "field": "isLegal", "title": "Est légal ?", "type": "nominal", "scale": {
                  "range": ["red", "green"]
                }
              },
              "tooltip": [
                { "field": "address", "type": "nominal", "title": "Adresse" },
                { "field": "renter", "type": "nominal", "title": "Loueur" },
                { "field": "postalCode", "type": "ordinal", "title": "Code postal" },
                { "field": "roomCount", "type": "quantitative", "title": "Nombre de pièce(s)" },
                { "field": "surface", "type": "quantitative", "title": "Surface" },
                { "field": "yearBuilt", "type": "quantitative", "title": "Année de construction" },
                { "field": "hasFurniture", "type": "nominal", "title": "Meublé" },
                { "field": "price", "type": "quantitative", "title": "Prix affiché" },
                { "field": "maxPrice", "type": "quantitative", "title": "Prix maximum" }
              ]
            },
            "mark": {
              "type": "circle",
              "color": "red"
            }
          }
        ]
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
        ...vegaService.commonOpts,
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

module.exports = router;