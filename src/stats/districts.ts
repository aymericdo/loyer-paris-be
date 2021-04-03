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

  res.json([
    ...new Set(
      geodata.features
        .map((data) => {
          switch (city) {
            case 'paris':
              return data['properties']['l_qu']
            case 'lille':
              return `Zone ${data['properties']['zonage']}`
          }
        })
        .sort()
    ),
  ])
}
