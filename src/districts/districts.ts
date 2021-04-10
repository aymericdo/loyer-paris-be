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
  }

  interface DistrictElem {
    label: string
    groupBy: string | null
  }

  res.json(
    geodata.features
      .reduce((prev: DistrictElem[], data) => {
        switch (city) {
          case 'paris': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.label === data['properties']['l_qu']
              )
            ) {
              prev.push({
                label: data['properties']['l_qu'],
                groupBy: data['properties']['c_ar'],
              })
            }
            break
          }
          case 'lille': {
            if (
              !prev.some(
                (elem: DistrictElem) =>
                  elem.label === `Zone ${data['properties']['zonage']}`
              )
            ) {
              prev.push({
                label: `Zone ${data['properties']['zonage']}`,
                groupBy: null,
              })
            }
            break
          }
        }

        return prev
      }, [])
      .sort((a: DistrictElem, b: DistrictElem) => {
        if (a.groupBy && b.groupBy) {
          return a.groupBy > b.groupBy ? 1 : -1
        } else {
          return a.label > b.label ? 1 : -1
        }
      })
  )
}
