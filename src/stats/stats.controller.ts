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
}

const parisGeodata = JSON.parse(
  fs.readFileSync(path.join('json-data/quartier_paris_geodata.json'), 'utf8')
)

const lilleGeodata = JSON.parse(
  fs.readFileSync(path.join('json-data/quartier_lille_geodata.json'), 'utf8')
)

// router.get('/need-captcha', getNeedCaptcha)
// function getNeedCaptcha(req: RentRequest, res: Response, next: NextFunction) {
//   log.info(`-> ${req.baseUrl} getNeedCaptcha`, 'blue')
//   const ipService = new IpService(req)
//   res.status(200).json(!ipService.isIpCached())
// }

// router.use('/', function (req: RentRequest, res: Response, next: NextFunction) {
//   const ipService = new IpService(req)

//   if (ipService.isIpCached()) {
//     next()
//   } else {
//     const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${req.query.recaptchaToken}`
//     axios
//       .post(
//         url,
//         {},
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
//           },
//         }
//       )
//       .then((response) => {
//         if (!response.data.success) {
//           return res.status(500).json({
//             message: response.data['error-codes'].join('.'),
//           })
//         } else {
//           ipService.saveIp()
//         }

//         next()
//       })
//       .catch(() => {
//         return res
//           .status(500)
//           .json({ message: 'oops, something went wrong on our side' })
//       })
//   }
// })

// routes
router.get('/map/:city', getMap)
function getMap(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getMap`, 'blue')
  const city = req.params.city
  let geodata: any
  let districtField: string
  switch (city) {
    case 'paris':
      geodata = parisGeodata
      districtField = 'properties.l_qu'
      break
    case 'lille':
      geodata = lilleGeodata
      districtField = 'properties.zonage'
      break
  }

  rentService
    .getMapData(city)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        layer: [
          {
            data: {
              format: { type: 'json', property: 'features' },
              values: geodata,
            },
            projection: { type: 'mercator' },
            mark: {
              type: 'geoshape',
              fill: 'lightgray',
              stroke: 'white',
            },
            encoding: {
              tooltip: { field: districtField, type: 'nominal' },
            },
          },
          {
            data: {
              values: data,
            },
            transform: [
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
              tooltip: { field: 'district', type: 'nominal' },
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

router.get('/chloropleth-map/:city', getChloroplethMap)
function getChloroplethMap(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} getChloroplethMap`, 'blue')
  const city = req.params.city
  let geodata: any
  let districtField: string
  switch (city) {
    case 'paris':
      geodata = parisGeodata
      districtField = 'properties.l_qu'
      break
    case 'lille':
      geodata = lilleGeodata
      districtField = 'properties.zonage'
      break
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
          isIllegal: Math.round((1 - value.isLegal / value.count) * 100),
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
            lookup: districtField,
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
            scale: { scheme: 'reds' },
            title: 'illégalité (%)',
          },
          tooltip: [
            {
              field: 'isIllegal',
              type: 'quantitative',
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

router.get('/price-difference/:city', getPriceDifference)
function getPriceDifference(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} priceDifference`, 'blue')
  const postalCodePossibilities =
    req.params.city === 'paris'
      ? cityList.paris.postalCodePossibilities
      : cityList.lille.postalCodePossibilities

  rentService
    .getPriceDiffData(req.params.city)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
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
            sort: postalCodePossibilities,
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

router.get('/is-legal-per-surface/:city', getLegalPerSurface)
function getLegalPerSurface(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerSurface`, 'blue')

  rentService
    .getLegalPerSurfaceData(req.params.city)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
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
  '/price-variation/:city',
  (req: RentRequest, res: Response, next: NextFunction) => {
    log.info(`-> ${req.baseUrl} priceVariation`, 'blue')
    rentService
      .getPriceVarData(req.params.city)
      .then((data) => {
        const vegaMap = {
          ...vegaCommonOpt(),
          data: {
            values: data,
          },
          transform: [
            { timeUnit: 'yearweek', field: 'createdAt', as: 'date' },
            { filter: 'datum.isLegal === false' },
            {
              calculate: 'datum.priceExcludingCharges - datum.maxPrice',
              as: 'priceDifference',
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
                  aggregate: 'median',
                  field: 'priceDifference',
                  type: 'quantitative',
                  title:
                    'Différence entre prix pratiqué et prix théorique en €',
                },
                x: {
                  field: 'createdAt',
                  title: 'Date',
                  type: 'temporal',
                  timeUnit: 'yearweek',
                },
              },
            },
            {
              mark: { type: 'line', color: '#fdcd56', tooltip: true },
              transform: [{ loess: 'priceDifference', on: 'date' }],
              encoding: {
                y: {
                  field: 'priceDifference',
                  type: 'quantitative',
                  title: 'Différence de prix lissée en €',
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

router.get(
  '/is-legal-variation/:city',
  (req: RentRequest, res: Response, next: NextFunction) => {
    log.info(`-> ${req.baseUrl} isLegalVariation`, 'blue')

    rentService
      .getPriceVarData(req.params.city)
      .then((data) => {
        const vegaMap = {
          ...vegaCommonOpt(),
          data: {
            values: data,
          },
          transform: [
            { timeUnit: 'yearweek', field: 'createdAt', as: 'date' },
            {
              joinaggregate: [
                {
                  op: 'count',
                  field: 'id',
                  as: 'numberAds',
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
                  as: 'numberIllegal',
                },
              ],
              groupby: ['date'],
            },
            {
              calculate: 'datum.numberIllegal / datum.numberAds * 100',
              as: 'percentOfTotal',
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
                  field: 'percentOfTotal',
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
              mark: { type: 'line', color: '#fdcd56', tooltip: true },
              transform: [{ loess: 'percentOfTotal', on: 'date' }],
              encoding: {
                y: {
                  field: 'percentOfTotal',
                  type: 'quantitative',
                  title: 'Pourcentage lissé',
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

router.get('/is-legal-per-renter/:city', getLegalPerRenter)
function getLegalPerRenter(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerRenter`, 'blue')

  rentService
    .getLegalPerRenterData(req.params.city)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          { filter: 'datum.renter != null' },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'id',
                as: 'numberAds',
              },
            ],
            groupby: ['renter'],
          },
          { filter: 'datum.isLegal === false' },
          { filter: 'datum.numberAds > 5' },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'isLegal',
                as: 'numberIllegal',
              },
            ],
            groupby: ['renter'],
          },
          {
            calculate: 'datum.numberIllegal / datum.numberAds * 100',
            as: 'percentOfTotal',
          },
        ],
        encoding: {
          x: {
            field: 'renter',
            title: 'Loueur',
            type: 'nominal',
            sort: '-y',
          },
          y: {
            aggregate: 'mean',
            field: 'percentOfTotal',
            title: 'Annonces à vérifier (%)',
            type: 'quantitative',
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

router.get('/is-legal-per-website/:city', getLegalPerWebsite)
function getLegalPerWebsite(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerRenter`, 'blue')

  rentService
    .getLegalPerWebsiteData(req.params.city)
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: 'bar', tooltip: true },
        transform: [
          { filter: 'datum.website != null' },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'id',
                as: 'numberAds',
              },
            ],
            groupby: ['website'],
          },
          { filter: 'datum.isLegal === false' },
          { filter: 'datum.numberAds > 5' },
          {
            joinaggregate: [
              {
                op: 'count',
                field: 'isLegal',
                as: 'numberIllegal',
              },
            ],
            groupby: ['website'],
          },
          {
            calculate: 'datum.numberIllegal / datum.numberAds * 100',
            as: 'percentOfTotal',
          },
        ],
        encoding: {
          x: {
            field: 'website',
            title: 'Site',
            type: 'nominal',
            sort: '-y',
          },
          y: {
            aggregate: 'mean',
            field: 'percentOfTotal',
            title: 'Annonces à vérifier (%)',
            type: 'quantitative',
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

router.get('/welcome', getWelcomeText)
function getWelcomeText(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getWelcomeText`, 'blue')

  rentService
    .getWelcomeData()
    .then((data) => {
      const rents = data

      const isIllegalPercentage = Math.round(
        (100 * rents.filter((rent) => !rent.isLegal).length) / rents.length
      )

      const pivotSurface = 30
      const lessThanNSquareMeters = rents.filter(
        (rent) => rent.surface < pivotSurface
      )
      const isSmallSurfaceIllegalPercentage = Math.round(
        (100 * lessThanNSquareMeters.filter((rent) => !rent.isLegal).length) /
          lessThanNSquareMeters.length
      )

      return res.json({
        numberRents: rents.length,
        pivotSurface: pivotSurface,
        isIllegalPercentage,
        isSmallSurfaceIllegalPercentage,
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

module.exports = router
