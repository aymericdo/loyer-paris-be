import { Response, NextFunction, Request } from 'express'
import * as log from '@helpers/log'
import { DistrictsList } from '@services/districts'

export function getDistricts(req: Request, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getDistricts`, 'blue')
  const city = req.params.city
  const districtList = new DistrictsList()

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

  res.json([
    ...new Set(
      geodata.features
        .map((data) => {
          switch (city) {
            case 'paris':
              return data['properties']['l_qu']
            case 'lille':
              return `Zone ${data['properties']['zonage']}`
            case 'plaine_commune':
              return `Zone ${data['properties']['Zone']}`
          }
        })
        .sort()
    ),
  ])
}
