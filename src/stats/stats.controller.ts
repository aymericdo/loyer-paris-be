import express, { NextFunction, Request, Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import * as rentService from '@db/rent.service'
import { DataBaseItem } from '@interfaces/database-item'
import { groupBy } from '@helpers/functions'
import * as log from '@helpers/log'
import { vegaCommonOpt } from '@helpers/vega'
import { IpService } from '@services/ip'
import { cityList } from '@services/address/city'
const router = express.Router()

interface RentRequest extends Request {
  rents?: DataBaseItem[]
  city?: string
}

router.use('/', function (req: RentRequest, res: Response, next: NextFunction) {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${req.query.recaptchaToken}`

  const ipService = new IpService(req)

  if (ipService.isIpCached()) {
    next()
  } else {
    axios
      .post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          },
        }
      )
      .then((response) => {
        if (!response.data.success) {
          return res.status(500).json({
            message: response.data['error-codes'].join('.'),
          })
        } else {
          ipService.saveIp()
        }

        next()
      })
      .catch(() => {
        return res
          .status(500)
          .json({ message: 'oops, something went wrong on our side' })
      })
  }
})

// routes
router.get('/map', getMap)
function getMap(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')

  const parisGeodata = JSON.parse(
    fs.readFileSync(path.join('json-data/quartier_paris_geodata.json'), 'utf8')
  )

  rentService
    .getMapData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        layer: [
          {
            data: {
              format: { type: 'json', property: 'features' },
              values: parisGeodata,
            },
            projection: { type: 'mercator' },
            mark: {
              type: 'geoshape',
              fill: 'lightgray',
              stroke: 'white',
            },
            encoding: {
              tooltip: { field: 'properties.l_qu', type: 'nominal' },
            },
          },
          {
            data: {
              values: data,
            },
            transform: [
              { filter: "datum.city === 'paris'" },
              { calculate: "datum.isLegal ? 'Oui' : 'Non'", as: 'isLegal' },
            ],
            encoding: {
              longitude: {
                field: 'longitude',
                type: 'quantitative',
              },
              latitude: {
                field: 'latitude',
                type: 'quantitative',
              },
              color: {
                field: 'isLegal',
                title: 'Est légal ?',
                type: 'nominal',
                scale: {
                  range: ['red', 'green'],
                },
              },
            },
            mark: {
              type: 'circle',
              color: 'red',
            },
          },
        ],
      }
      res.json(vegaMap)
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
}

router.get('/chloropleth-map', getChloroplethMap)
function getChloroplethMap(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getChloroplethMap`, 'blue')
  const city = req.city || 'lille'
  let geodata: any
  switch (city) {
    case 'paris':
      geodata = JSON.parse(
        fs.readFileSync(
          path.join('json-data/quartier_paris_geodata.json'),
          'utf8'
        )
      )
    case 'lille':
      geodata = JSON.parse(
        fs.readFileSync(
          path.join('json-data/quartier_lille_geodata.json'),
          'utf8'
        )
      )
  }

  rentService
    .getChloroplethMapData(city)
    .then((data) => {
      const reduced: {
        [district: string]: { isLegal: number; count: number }
      } = data.reduce((m, d: { isLegal: boolean; district: string }) => {
        if (!m[d.district]) {
          m[d.district] = {
            count: 1,
            isLegal: d.isLegal ? 1 : 0,
          }
        } else {
          if (d.isLegal) {
            m[d.district].isLegal += 1
          }
          m[d.district].count += 1
        }
        return m
      }, {})

      const result = Object.keys(reduced).map((district: string) => {
        const value = reduced[district]
        return {
          district,
          isIllegal: Math.round((1 - value.isLegal / value.count) * 100) / 100,
        }
      })

      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          format: { type: 'json', property: 'features' },
          values: geodata,
        },
        transform: [
          {
            lookup: 'properties.l_qu',
            from: {
              data: {
                values: result,
              },
              key: 'district',
              fields: ['isIllegal', 'district'],
            },
          },
        ],
        projection: {
          type: 'mercator',
        },
        mark: 'geoshape',
        encoding: {
          color: {
            field: 'isIllegal',
            type: 'quantitative',
            format: '.0%',
            scale: { scheme: 'reds' },
            title: '% illégalité',
          },
          tooltip: [
            {
              field: 'isIllegal',
              type: 'quantitative',
              format: '.0%',
              title: 'Annonces à surveiller',
            },
            {
              field: 'district',
              type: 'nominal',
              title: 'Quartier',
            },
          ],
        },
      }
      res.json(vegaMap)
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
}

router.get('/price-difference', getPriceDifference)
function getPriceDifference(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} priceDifference`, 'blue')

  rentService
    .getPriceDiffData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          { filter: "datum.city === 'paris'" },
          {
            calculate: 'datum.priceExcludingCharges - datum.maxPrice',
            as: 'priceDifference',
          },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'postalCode',
                as: 'countOfPostalCode',
              },
            ],
            groupby: ['postalCode'],
          },
          { filter: 'datum.isLegal === false' },
        ],
        encoding: {
          x: {
            aggregate: 'mean',
            field: 'priceDifference',
            type: 'quantitative',
            title:
              'Différence moyenne entre prix pratiqué et prix théorique (annonces illégales)',
          },
          y: {
            field: 'postalCode',
            type: 'ordinal',
            title: 'Code postal',
            sort: cityList.paris.postalCodePossibilities,
          },
          tooltip: [{ field: 'countOfPostalCode', title: "Nombre d'annonces" }],
        },
      }

      res.json(vegaMap)
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
}

router.get('/is-legal-per-surface', getLegalPerSurface)
function getLegalPerSurface(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerSurface`, 'blue')

  rentService
    .getLegalPerSurfaceData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          { filter: "datum.city === 'paris'" },
          { calculate: "datum.isLegal ? 'Oui' : 'Non'", as: 'isLegal' },
        ],
        encoding: {
          x: {
            bin: {
              step: 5,
            },
            field: 'surface',
            title: 'Surface',
            type: 'quantitative',
          },
          y: {
            aggregate: 'count',
            field: 'isLegal',
            title: 'Annonces',
            type: 'quantitative',
          },
          color: {
            field: 'isLegal',
            title: 'Est légal ?',
            type: 'nominal',
            scale: {
              range: ['red', 'green'],
            },
          },
        },
      }

      res.json(vegaMap)
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
}

router.get('/adoption', getAdoptionRate)
function getAdoptionRate(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} adoption`, 'blue')

  rentService
    .getAdoptionData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'line', tooltip: true, interpolate: 'monotone' },
        transform: [
          {
            sort: [{ field: 'createdAt' }],
            window: [{ op: 'count', field: 'count', as: 'cumulative_count' }],
            frame: [null, 0],
          },
        ],
        encoding: {
          x: {
            field: 'createdAt',
            title: 'Date',
            type: 'temporal',
            timeUnit: 'yearmonthdate',
          },
          y: {
            field: 'cumulative_count',
            title: "Nombre d'annonces",
            type: 'quantitative',
          },
        },
      }
      vegaMap.config['mark'] = { color: '#FBC652' }

      res.json(vegaMap)
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
}

router.get(
  '/price-variation',
  (req: RentRequest, res: Response, next: NextFunction) => {
    log.info(`-> ${req.baseUrl} priceVariation`, 'blue')

    rentService
      .getPriceVarData()
      .then((data) => {
        const vegaMap = {
          ...vegaCommonOpt(),
          data: {
            values: data,
          },
          mark: { type: 'area', color: '#f03434', tooltip: true },
          transform: [
            { filter: "datum.city === 'paris'" },
            { filter: 'datum.isLegal === false' },
            {
              calculate: 'datum.priceExcludingCharges - datum.maxPrice',
              as: 'priceDifference',
            },
          ],
          encoding: {
            y: {
              aggregate: 'median',
              field: 'priceDifference',
              type: 'quantitative',
              title: 'Différence entre prix pratiqué et prix théorique en €',
            },
            x: {
              field: 'createdAt',
              title: 'Date',
              type: 'temporal',
              timeUnit: 'yearweek',
            },
          },
        }

        res.json(vegaMap)
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
  }
)

router.get(
  '/is-legal-variation',
  (req: RentRequest, res: Response, next: NextFunction) => {
    log.info(`-> ${req.baseUrl} isLegalVariation`, 'blue')

    rentService
      .getPriceVarData(req.city || 'paris')
      .then((data) => {
        const vegaMap = {
          ...vegaCommonOpt(),
          data: {
            values: data,
          },
          transform: [
            { filter: "datum.city === 'paris'" },
            { timeUnit: 'yearweek', field: 'createdAt', as: 'date' },
            {
              joinaggregate: [
                {
                  op: 'count',
                  field: 'id',
                  as: 'NumberAds',
                },
              ],
              groupby: ['date'],
            },
            { filter: 'datum.isLegal === false' },
            {
              joinaggregate: [
                {
                  op: 'count',
                  field: 'isLegal',
                  as: 'NumberIllegal',
                },
              ],
              groupby: ['date'],
            },
            {
              calculate: 'datum.NumberIllegal / datum.NumberAds * 100',
              as: 'PercentOfTotal',
            },
          ],
          layer: [
            {
              mark: {
                type: 'line',
                color: '#f03434',
                tooltip: true,
              },
              encoding: {
                y: {
                  field: 'PercentOfTotal',
                  type: 'quantitative',
                  title: 'Pourcentage',
                },
                x: {
                  field: 'date',
                  title: 'Date',
                  type: 'temporal',
                },
              },
            },
            {
              mark: { type: 'line', color: '#fdcd56' },
              transform: [{ loess: 'PercentOfTotal', on: 'date' }],
              encoding: {
                y: {
                  field: 'PercentOfTotal',
                  type: 'quantitative',
                },
                x: {
                  field: 'date',
                  title: 'Date',
                  type: 'temporal',
                },
              },
            },
          ],
        }

        res.json(vegaMap)
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
  }
)

router.get('/welcome', getWelcomeText)
function getWelcomeText(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getWelcomeText`, 'blue')

  rentService
    .getWelcomeData(req.city || 'paris')
    .then((data) => {
      const rents = data

      const isIllegalPercentage = Math.round(
        (100 * rents.filter((rent) => !rent.isLegal).length) / rents.length
      )
      const lessThan35SquareMeters = rents.filter((rent) => rent.surface < 35)
      const isSmallSurfaceIllegalPercentage = Math.round(
        (100 * lessThan35SquareMeters.filter((rent) => !rent.isLegal).length) /
          lessThan35SquareMeters.length
      )
      const districtGroupedRents = groupBy(rents, 'district')
      const extremeDistrict = getExtremeDistrict(districtGroupedRents)
      const worstDistrict = extremeDistrict[0]
      const bestDistrict = extremeDistrict[1]

      return res.json({
        numberRents: rents.length,
        pivotSurface: 35,
        isIllegalPercentage,
        isSmallSurfaceIllegalPercentage,
        worstDistrict,
        bestDistrict,
      })
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
}

function getExtremeDistrict(groupedRents) {
  let worstDistrict = ''
  let bestDistrict = ''
  let bestLegalsCount = 0
  let worstLegalsCount = 0

  Object.keys(groupedRents).forEach((district) => {
    const districtRents = groupedRents[district]

    const legalsRatio =
      districtRents.filter((rent) => rent.isLegal).length / districtRents.length
    if (bestLegalsCount < legalsRatio) {
      console.log
      bestDistrict = district
      bestLegalsCount = legalsRatio
    }

    const illegalsRatio =
      districtRents.filter((rent) => !rent.isLegal).length /
      districtRents.length
    if (worstLegalsCount < illegalsRatio) {
      worstDistrict = district
      worstLegalsCount = illegalsRatio
    }
  })
  return [worstDistrict, bestDistrict]
}

module.exports = router
