const fs = require('fs')
const express = require('express')
const router = express.Router()
const log = require('helper/log.helper')
const rentService = require('db/rent.service')

const parisGeodata = JSON.parse(fs.readFileSync('json-data/quartier_paris_geodata.json', 'utf8'))

// routes
router.get('/map', getMap)
function getMap(req, res, next) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  rentService.getAll((data) => {
    const vegaMap = {
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "title": "Carte encadrement des loyers à Paris",
      "width": 700,
      "height": 500,
      "config": {
        "view": {
          "stroke": "transparent"
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
              { "field": "roomCount.$numberInt", "type": "quantitative" },
              { "field": "surface.$numberInt", "type": "quantitative" },
              { "field": "yearBuilt.$numberInt", "type": "quantitative" },
              { "field": "hasFurniture", "type": "nominal" },
              { "field": "price.$numberInt", "type": "quantitative" },
              { "field": "maxPrice.$numberDouble", "type": "quantitative" }
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
  }, (err) => {
    res.status(err.status).json(err)
  })
}

module.exports = router;