import { Response, Request } from 'express'
import { PrettyLog } from '@services/pretty-log'
import { DistrictsList } from '@services/districts'

export function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
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
    case 'lyon':
      geodata = districtList.lyonGeodata()
      break
    case 'est_ensemble':
      geodata = districtList.estEnsembleGeodata()
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
            case 'lyon':
              return `Zone ${data['properties']['zonage']}`
          }
        })
        .sort()
    ),
  ])
}
