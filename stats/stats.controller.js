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
            values: data.reduce((prev, { isLegal, latitude, longitude }) => {
              if (latitude && longitude) {
                prev.push({ isLegal, latitude, longitude })
              }
              return prev
            }, [])
          },
          transform: [
            { calculate: "datum.isLegal ? 'Oui' : 'Non'", "as": "isLegal" },
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
        values: data.reduce((prev, { maxPrice, postalCode, priceExcludingCharges }) => {
          if (postalCode) {
            prev.push({ maxPrice, postalCode, priceExcludingCharges })
          }
          return prev
        }, [])
      },
      mark: { type: "bar", tooltip: true },
      transform: [
        { calculate: "datum.priceExcludingCharges - datum.maxPrice", as: "priceDifference" },
        {
          joinaggregate: [{
            op: "count",
            field: "postalCode",
            as: "countOfPostalCode"
          }],
          groupby: [
            "postalCode"
          ],
        },
        { filter: { field: "countOfPostalCode", gte: 5 } },
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
          sort: [
            '75001',
            '75002',
            '75003',
            '75004',
            '75005',
            '75006',
            '75007',
            '75008',
            '75009',
            '75010',
            '75011',
            '75012',
            '75013',
            '75014',
            '75015',
            '75016',
            '75116',
            '75017',
            '75018',
            '75019',
            '75020',
          ],
        },
        tooltip: [
          { field: "countOfPostalCode", title: "Nombre d'annonces" },
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
        values: data.reduce((prev, { isLegal, surface }) => {
          if (surface <= 100) {
            prev.push({ isLegal, surface })
          }
          return prev
        }, [])
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
          type: "quantitative",
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