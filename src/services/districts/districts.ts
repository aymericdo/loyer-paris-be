import { Response, Request } from 'express'
import { PrettyLog } from '@services/helpers/pretty-log'
import { DistrictsList } from '@services/districts/districts-list'
import { AvailableMainCities } from '@services/address/city'

export function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
  const city = req.params.city

  const geodata = new DistrictsList(city as AvailableMainCities).currentGeodataWithGroupBy()

  res.json(geodata)
}
