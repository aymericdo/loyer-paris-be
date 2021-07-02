import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import * as fs from 'fs'
import * as path from 'path'
import { Memoize } from 'typescript-memoize'

export class DistrictList {
  constructor() {}

  @Memoize()
  parisGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_paris_geodata.json'),
        'utf8'
      )
    )
  }

  @Memoize()
  lilleGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_lille_geodata.json'),
        'utf8'
      )
    )
  }

  @Memoize()
  plaineCommuneGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_plaine-commune_geodata.json'),
        'utf8'
      )
    )
  }
}

export function getDistricts(req: Request, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getDistricts`, 'blue')
  const city = req.params.city
  const districtList = new DistrictList()

  let geodata: any
  switch (city) {
    case 'paris':
      geodata = districtList.parisGeodata()
      break
    case 'lille':
      geodata = districtList.lilleGeodata()
      break
    case 'plaine_commune':
      geodata = districtList.plaineCommuneGeodata()
      break
  }

  interface DistrictElem {
    value: string
    groupBy: string | null
    displaySequence: number
  }

  res.json(
    geodata.features
      .reduce((prev: DistrictElem[], data) => {
        switch (city) {
          case 'paris': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === data['properties']['l_qu']
              )
            ) {
              prev.push({
                value: data['properties']['l_qu'],
                displaySequence: data['properties']['c_ar'],
                groupBy: `${data['properties']['c_ar']}${(data['properties'][
                  'c_ar'
                ] > 1
                  ? 'ème'
                  : 'er'
                ).toString()} arrondissement`,
              })
            }
            break
          }
          case 'lille': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['zonage']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['zonage']}`,
                displaySequence: data['properties']['zonage'],
                groupBy: null,
              })
            }
            break
          }
          case 'plaine_commune': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.value === `Zone ${data['properties']['Zone']}`
              )
            ) {
              prev.push({
                value: `Zone ${data['properties']['Zone']}`,
                displaySequence: data['properties']['Zone'],
                groupBy: null,
              })
            }
            break
          }
        }

        return prev
      }, [])
      .sort((a: DistrictElem, b: DistrictElem) => {
        return a.displaySequence > b.displaySequence ? 1 : -1
      })
  )
}
