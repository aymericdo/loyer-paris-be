import { AvailableCities, AvailableMainCities } from '@services/address/city'
import { DistrictsList } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'

export async function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  const city: AvailableCities = req.query.city as AvailableCities

  const geodata = await new DistrictsList(mainCity as AvailableMainCities, { specificCity: city }).currentGeodataWithGroupBy()

  res.json(geodata)
}
