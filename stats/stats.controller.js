const fs = require('fs')
const express = require('express')
const request = require('request')
const router = express.Router()
const log = require('helper/log.helper')
const rentService = require('db/rent.service')

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
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        "title": {
          "text": "Carte encadrement des loyers à Paris",
          "color": "#fdcd56",
          "fontSize": 22,
          "fontFamily": "Garnett"
        },
        "width": 700,
        "height": 500,
        "padding": 5,
        "background": "#222222",
        "color": "white",
        "config": {
          "view": {
            "stroke": "transparent"
          },
          "legend": {
            "labelColor": "white",
            "labelFontSize": 12,
            "titleColor": "white",
            "titleFontSize": 16
          }
        },
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
              { "filter": { "field": "latitude", "valid": true } }
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
                "field": "isLegal", "type": "nominal", "scale": {
                  "range": ["red", "green"]
                }
              },
              "tooltip": [
                { "field": "address", "type": "nominal" },
                { "field": "renter", "type": "nominal" },
                { "field": "postalCode", "type": "ordinal" },
                { "field": "roomCount", "type": "quantitative" },
                { "field": "surface", "type": "quantitative" },
                { "field": "yearBuilt", "type": "quantitative" },
                { "field": "hasFurniture", "type": "nominal" },
                { "field": "price", "type": "quantitative" },
                { "field": "maxPrice", "type": "quantitative" }
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
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        "width": 500,
        "height": 400,
        "padding": 5,
        "title": {
          "text": "Encandrement des loyers par surface",
          "color": "white",
          "fontSize": 18
        },
        "background": "#0f0f0f",
        "color": "white",
        "config": {
          "legend": {
            "labelColor": "white",
            "labelFontSize": 12,
            "titleColor": "white",
            "titleFontSize": 16
          }
        },
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
            "type": "quantitative"
          },
          "y": {
            "aggregate": "count",
            "field": "isLegal",
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