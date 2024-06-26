import { AvailableCities, AvailableMainCities, mainCityList } from '@services/address/city'
import { DistrictsList } from '@services/districts/districts-list'
import { PrettyLog } from '@services/helpers/pretty-log'
import { Request, Response } from 'express'

export async function getDistricts(req: Request, res: Response) {
  PrettyLog.call(`-> ${req.baseUrl} getDistricts`, 'blue')
  const mainCity: AvailableMainCities = req.params.city as AvailableMainCities
  if (!mainCityList.includes(mainCity)) {
    res.status(403).json({ message: 'City params not valid' })
    return
  }

  const city: AvailableCities = req.query.city as AvailableCities
  const geodata = await new DistrictsList(mainCity as AvailableMainCities, { specificCity: city }).currentGeodataWithGroupBy()

  res.json(geodata)
}
