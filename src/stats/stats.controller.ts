import express, { NextFunction, Request, Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import request from 'request'
import * as rentService from '../db/rent.service'
import { DataBaseItem } from '@interfaces/shared'
import { groupBy } from '@helpers/group-by'
import * as ip from '@helpers/ip'
import * as log from '@helpers/log'
import * as vegaService from '@services/vega'
const router = express.Router()

const parisGeodata = JSON.parse(fs.readFileSync(path.join('json-data/quartier_paris_geodata.json'), 'utf8'))

interface RentRequest extends Request {
  rents?: DataBaseItem[]
}

router.use('/', function (req: RentRequest, res: Response, next: NextFunction) {
  const verifyCaptchaOptions = {
    uri: "https://www.google.com/recaptcha/api/siteverify",
    json: true,
    form: {
      secret: process.env.CAPTCHA_SECRET,
      response: req.query.recaptchaToken
    }
  }

  rentService.getAll()
    .then((data) => {
      req.rents = data

      if (ip.isIpCached(ip.getIp(req))) {
        next()
      } else {
        ip.saveIp(ip.getIp(req))
        request.post(verifyCaptchaOptions, (err, response, body) => {
          if (err) {
            return res.status(500).json({ message: "oops, something went wrong on our side" })
          }

          if (!body.success) {
            return res.status(500).json({ message: body["error-codes"].join(".") })
          }

          next()
        })
      }
    })
    .catch((err) => {
      console.log(err)
      if (err.status) {
        res.status(err.status).json(err)
      } else {
        log.error('Error 500')
        res.status(500).json(err)
      }
    })
})

// routes
router.get('/map', getMap)
function getMap(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

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
          values: req.rents.reduce((prev, { isLegal, latitude, longitude }) => {
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
}

router.get('/price-difference', getPriceDifference)
function getPriceDifference(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} priceDifference`, 'blue')

  const vegaMap = {
    ...vegaService.commonOpts(),
    data: {
      values: req.rents.reduce((prev, { maxPrice, postalCode, priceExcludingCharges }) => {
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
}

router.get('/is-legal-per-surface', getLegalPerSurface)
function getLegalPerSurface(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} isLegalPerSurface`, 'blue')

  const vegaMap = {
    ...vegaService.commonOpts(),
    data: {
      values: req.rents.reduce((prev, { isLegal, surface }) => {
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
}

router.get('/adoption', getAdoptionRate)
function getAdoptionRate(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} adoption`, 'blue')

  const vegaMap = {
    ...vegaService.commonOpts(),
    data: {
      values: req.rents.reduce((prev, { createdAt, surface }) => {
        if (surface <= 100) {
          prev.push({ createdAt })
        }
        return prev
      }, [])
    },
    mark: { type: "line", tooltip: true, interpolate: "monotone" },
    transform: [{
      sort: [{ field: "createdAt" }],
      window: [{ op: "count", field: "count", as: "cumulative_count" }],
      frame: [null, 0]
    }],
    encoding: {
      x: {
        field: "createdAt",
        title: "Date",
        type: "temporal",
        timeUnit: "yearmonthdate"
      },
      y: {
        field: "cumulative_count",
        title: "Nombre d'annonces",
        type: "quantitative",
      }
    }
  }
  vegaMap.config["mark"] = { color: "#FBC652" }

  res.json(vegaMap)
}

router.get('/welcome', getWelcomeText)
function getWelcomeText(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getWelcomeText`, 'blue')

  const rents = req.rents

  const isIllegalPercentage = Math.round(100 * rents.filter(rent => !rent.isLegal).length / rents.length)
  const lessThan35SquareMeters = rents.filter(rent => rent.surface < 35)
  const isSmallSurfaceIllegalPercentage = Math.round(100 * lessThan35SquareMeters.filter(rent => !rent.isLegal).length / lessThan35SquareMeters.length)
  const postalCodeGroupedRents = groupBy(rents, "postalCode")
  const extremePostalCode = getExtremePostalCode(postalCodeGroupedRents)
  const worstPostalCode = extremePostalCode[0]
  const bestPostalCode = extremePostalCode[1]

  return res.json({
    numberRents: rents.length,
    pivotSurface: 35,
    isIllegalPercentage,
    isSmallSurfaceIllegalPercentage,
    worstPostalCode,
    bestPostalCode,
  })
}

function getExtremePostalCode(groupedRents) {
  let worstPc = ""
  let bestPc = ""
  let bestLegalsCount = 0
  let worstLegalsCount = 0

  Object.keys(groupedRents).forEach(pc => {
    if (isNaN(+pc)) { return }
    const pcRents = groupedRents[pc]

    const legalsRatio = pcRents.filter(rent => rent.isLegal).length / pcRents.length
    if (bestLegalsCount < legalsRatio) {
      bestPc = pc
      bestLegalsCount = legalsRatio
    }

    const illegalsRatio = pcRents.filter(rent => !rent.isLegal).length / pcRents.length
    if (worstLegalsCount < illegalsRatio) {
      worstPc = pc
      worstLegalsCount = illegalsRatio
    }
  })
  const worstNeighborhood = worstPc.slice(-2)[0] === '0' ? worstPc.slice(-1) : worstPc.slice(-2)
  const bestNeighborhood = bestPc.slice(-2)[0] === '0' ? bestPc.slice(-1) : bestPc.slice(-2)
  return [worstNeighborhood, bestNeighborhood]
}

module.exports = router