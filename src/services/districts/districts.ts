import { AvailableMainCities } from '@services/address/city'
import { DistrictsList } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'

export function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
  const city = req.params.city

  const geodata = new DistrictsList(city as AvailableMainCities).currentGeodataWithGroupBy()

  res.json(geodata)
}
